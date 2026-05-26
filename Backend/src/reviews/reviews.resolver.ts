// ../reviews/reviews.resolver.ts
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { DriverStats } from './graphql/driver-stats.type';
import { TripsService } from '../trips/trips.service';
import { ReviewType } from './graphql/review.type';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';

@Resolver()
export class ReviewsResolver {
  constructor(private reviewsService: ReviewsService, private tripsService: TripsService) {}

  @Query(() => DriverStats)
  async driverStats(@Args('id', { type: () => Int }) id: number): Promise<DriverStats> {
    const reviews = await this.reviewsService.getDriverReviews(id);
    const averageRating = await this.reviewsService.getDriverAverageRating(id);
    const totalTrips = await this.tripsService.countCompletedTripsByDriver(id);

    const distribution = [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));

    // flatten all tags and count occurrences
    const tagCounts: Record<string, number> = {};
    reviews.forEach(r => {
      r.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const [lastTenAverage, positiveRate, trend, monthlyAverages, badgeRecords] = await Promise.all([
    this.reviewsService.getLastTenAverage(id),
    this.reviewsService.getPositiveRate(id),
    this.reviewsService.getTrend(id),
    this.reviewsService.getMonthlyAverages(id),
    this.reviewsService.getDriverBadges(id),
    ]);
    return {
      averageRating,
      totalReviews: reviews.length,
      totalTrips,
        distribution,
        topTags,
        analytics: { lastTenAverage, positiveRate, trend, monthlyAverages },
        badges: badgeRecords.map(b => b.badge),
      };
  }

  // driver — anonymous
  @Query(() => [ReviewType])
  @UseGuards(GqlJwtAuthGuard)
  async myReviews(@CurrentUser() user: User): Promise<ReviewType[]> {
    return this.reviewsService.getDriverReviews(user.id);
  }

  // admin — full info
  @Query(() => [ReviewType])
  @UseGuards(GqlJwtAuthGuard)
  async driverReviewsAdmin(@Args('driverId', { type: () => Int }) driverId: number,): Promise<ReviewType[]> {
    return this.reviewsService.getDriverReviewsAdmin(driverId);
  }

  
}


