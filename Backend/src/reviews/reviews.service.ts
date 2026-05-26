import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Trip } from '../trips/entities/trip.entity';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Trend } from './graphql/driver-analytics.type';
import { Badge } from './enums/badge.enum';
import { TripsService } from 'src/trips/trips.service';
import { ReviewTag } from './enums/review-tag.enum';
import { DriverBadge } from './entities/driver-badge.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    @InjectRepository(DriverBadge)
    private badgeRepo: Repository<DriverBadge>,
    private eventEmitter: EventEmitter2,
    private tripsService: TripsService,
  ) {}

  async submitReview(body: CreateReviewDto & { passengerId: number }) {
    
    const trip = await this.tripRepo.findOne({ where: { id: body.tripId } });

    if (!trip) throw new NotFoundException('Trajet introuvable');
    if (trip.status !== 'completed') 
      throw new BadRequestException('Ce trajet ne peut pas encore être évalué');

    if (body.passengerId === trip.driverId)
    throw new BadRequestException('Vous ne pouvez pas vous noter vous-même');
    
    const existing = await this.reviewRepo.findOne({
      where: { 
        passenger: { id: body.passengerId },
        trip: { id: body.tripId },
      },
    });
    if (existing)
      throw new BadRequestException('Vous avez déjà soumis un avis pour ce trajet');

    const review = this.reviewRepo.create({
      rating: body.rating,
      comment: body.comment,
      driver: { id: trip.driverId } as any,
      passenger: { id: body.passengerId } as any,
      trip: { id: body.tripId } as any,
      tags: body.tags,
    });

    await this.reviewRepo.save(review);

    const avg = await this.getDriverAverageRating(trip.driverId);
    this.eventEmitter.emit('review.submitted', {
      driverId: trip.driverId,
      averageRating: avg,
      newReview: {
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        // pas de passengerId => anonymat respecté
      }});

    await this.computeAndSaveBadges(trip.driverId); 
    return review;
  }

  async updateReview(id: number, dto: UpdateReviewDto, userId: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Avis introuvable');

    if (review.passengerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres avis');
    }

    Object.assign(review, {
      ...(dto.rating && { rating: dto.rating }),
      ...(dto.comment && { comment: dto.comment }),
      ...(dto.tags && { tags: dto.tags })
    });

    return this.reviewRepo.save(review);
  }



  async deleteReview(id: number, userId: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Avis introuvable');
    if (review.passengerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres avis');
    }
    await this.reviewRepo.remove(review);
    return { message: 'Avis supprimé' };
  }

  async getDriverReviews(driverId: number) {
  return this.reviewRepo.find({
    where: { driver: { id: driverId } },
    relations: ['passenger', 'trip'],
    order: { createdAt: 'DESC' },
  });
}

  async getDriverReviewsAdmin(driverId: number) {
    return this.reviewRepo.find({
      where: { driver: { id: driverId } },
      
      order: { createdAt: 'DESC' },
    });
  }

  async getTripReviews(tripId: number) {
    return this.reviewRepo.find({
      where: { trip: { id: tripId } },
      relations: ['driver', 'passenger'],
    });
  }

  async getDriverAverageRating(driverId: number): Promise<number> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.driverId = :driverId', { driverId })
      .getRawOne();
    return parseFloat(result?.avg ?? '0');
  }
  
  //moyenne par mois des 6 derniers mois
  async getMonthlyAverages(driverId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select("DATE_FORMAT(review.createdAt, '%Y-%m')", 'month')
      .addSelect('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('review.driver', 'driver')
      .where('driver.id = :driverId', { driverId })
      .andWhere("review.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)")
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(r => ({
      month: r.month,
      avg: parseFloat(r.avg),
      count: parseInt(r.count),
    }));
  }

  //moyenne des 10 derniers avis
  async getLastTenAverage(driverId: number): Promise<number> {
    const reviews = await this.reviewRepo.find({
      where: { driver: { id: driverId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(2));
  }

  //pourcentage des avis positifs (4-5 étoiles) d'un conducteur
  async getPositiveRate(driverId: number): Promise<number> {
    const total = await this.reviewRepo.count({
      where: { driver: { id: driverId } },
    });
    if (!total) return 0;

    const positive = await this.reviewRepo.count({
      where: { driver: { id: driverId }, rating: MoreThanOrEqual(4) },
    });

    return parseFloat(((positive / total) * 100).toFixed(1));
  }

  // trend: compare la moyenne des 5 derniers reviews vs la moyenne des 5 reviews précédents
  async getTrend(driverId: number): Promise<Trend> {
    const reviews = await this.reviewRepo.find({
      where: { driver: { id: driverId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (reviews.length < 10) return Trend.STABLE;

    const last5 = reviews.slice(0, 5).reduce((acc, r) => acc + r.rating, 0) / 5;
    const prev5 = reviews.slice(5, 10).reduce((acc, r) => acc + r.rating, 0) / 5;

    if (last5 > prev5 + 0.2) return Trend.UP;
    if (last5 < prev5 - 0.2) return Trend.DOWN;
    return Trend.STABLE;
  }

  async computeAndSaveBadges(driverId: number): Promise<Badge[]> {
    const reviews = await this.reviewRepo.find({
      where: { driver: { id: driverId } },
    });

    if (!reviews.length) return [];

    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    const totalReviews = reviews.length;
    const totalTrips = await this.tripsService.countCompletedTripsByDriver(driverId);

    // fetch all drivers' stats for percentile comparison
    const allTripCounts = await this.tripsService.getAllDriversTripCounts();
    const allReviewCounts = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.driverId', 'driverId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('review.driverId')
      .getRawMany();

    const percentileRank = (value: number, allValues: number[]): number => {
      const below = allValues.filter(v => v < value).length;
      return (below / allValues.length) * 100;
    };

    const tripCounts = allTripCounts.map(d => d.count);
    const reviewCounts = allReviewCounts.map(d => parseInt(d.count));

    const tripPercentile = percentileRank(totalTrips, tripCounts);
    const reviewPercentile = percentileRank(totalReviews, reviewCounts);

    const tagRate = (tag: string) => {
      const count = reviews.filter(r => r.tags?.includes(tag as ReviewTag)).length;
      return (count / totalReviews) * 100;
    };

    const earned: Badge[] = [];
    if (avg > 4.8) earned.push(Badge.EXCELLENT_DRIVER);
    if (tagRate('CLEAN_CAR') >= 5) earned.push(Badge.CLEAN_CAR);
    if (tagRate('PUNCTUAL') >= 5) earned.push(Badge.ALWAYS_ON_TIME);
    if (tripPercentile >= 75 && avg > 4.5) earned.push(Badge.SAFE_DRIVER);   // top 25% trips
    if (tagRate('FRIENDLY') >= 5) earned.push(Badge.FRIENDLY);
    if (reviewPercentile >= 5) earned.push(Badge.POPULAR);                   // top 20% reviews

    const existing = await this.badgeRepo.find({ where: { driverId } });
    const existingBadges = existing.map(b => b.badge);
    const newBadges = earned.filter(b => !existingBadges.includes(b));

    if (newBadges.length) {
      await this.badgeRepo.save(
        newBadges.map(badge => this.badgeRepo.create({ driverId, badge }))
      );
      this.eventEmitter.emit('badge.unlocked', { driverId, badges: newBadges });
    }

    return earned;
  }


  async getDriverBadges(driverId: number) {
    return this.badgeRepo.find({ where: { driverId } });
  }


}