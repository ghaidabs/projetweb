import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Trip } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { SearchTripsInput, TripSortBy } from './graphql/search-trips.input';
import { PaginatedTripsType } from './graphql/paginated-trips.type';
import { Booking } from 'src/bookings/entities/booking.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private eventEmitter: EventEmitter2,
  ) { }

  async createTrip(driverId: number, dto: CreateTripDto) {
    const trip = this.tripRepo.create({
      ...dto,
      date: new Date(dto.date),
      driverId,
    });
    const saved = await this.tripRepo.save(trip);

    this.eventEmitter.emit('trip.created', { tripId: saved.id, trip: saved });

    return saved;
  }

  async updateTrip(tripId: number, driverId: number, dto: UpdateTripDto) {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });

    if (!trip) throw new NotFoundException('Trajet introuvable');
    if (trip.driverId !== driverId)
      throw new ForbiddenException('Pas ton trajet');
    if (trip.status !== 'active')
      throw new BadRequestException('Trajet annulé ou terminé');
    if (new Date(trip.date) <= new Date())
      throw new BadRequestException('Trajet déjà parti');

    Object.assign(trip, {
      ...(dto.departure && { departure: dto.departure }),
      ...(dto.destination && { destination: dto.destination }),
      ...(dto.date && { date: new Date(dto.date) }),
      ...(dto.seats !== undefined && { seats: dto.seats }),
      ...(dto.price !== undefined && { price: dto.price }),
    });

    return this.tripRepo.save(trip);
  }

  async cancelTrip(tripId: number, driverId: number, reason?: string) {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });

    if (!trip) throw new NotFoundException('Trajet introuvable');
    if (trip.driverId !== driverId)
      throw new ForbiddenException('Pas ton trajet');
    if (trip.status !== 'active')
      throw new BadRequestException('Trajet déjà annulé');

    trip.status = 'cancelled';
    const updated = await this.tripRepo.save(trip);

    this.eventEmitter.emit('trip.cancelled', {
      tripId: trip.id,
      reason: reason ?? 'Annulé par le conducteur',
    });

    return updated;
  }

  async getMyTrips(driverId: number) {
    return this.tripRepo.find({
      where: { driverId },
      order: { date: 'DESC' },
    });
  }

  async getTripById(tripId: number) {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trajet introuvable');
    return trip;
  }

  async getUpcomingTrips(page = 1, limit = 10) {
    const [trips, total] = await this.tripRepo.findAndCount({
      where: {
        status: 'active',
        date: MoreThanOrEqual(new Date()),
      },
      order: { date: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return trips;
  }

  async completeTrip(tripId: number, driverId: number) {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trajet introuvable');
    if (trip.driverId !== driverId) throw new ForbiddenException('Vous n\'êtes pas le conducteur de ce trajet');

    const bookings = await this.bookingRepo.find({
      where: { tripId, status: 'confirmed' },
    });
    const passengerIds = bookings.map(b => b.passengerId);

    trip.status = 'completed';
    const updated = await this.tripRepo.save(trip);

    this.eventEmitter.emit('trip.completed', { tripId, driverId, passengerIds });

    return updated;
  }


  async searchTrips(filters: SearchTripsInput): Promise<PaginatedTripsType> {
    const {
      departure,
      destination,
      date,
      minSeats,
      maxPrice,
      sortBy = TripSortBy.DATE,
      sortOrder = 'ASC',
      after,
    } = filters;

    const first = Math.min(filters.first ?? 5, 50);

    const qb = this.tripRepo
      .createQueryBuilder('trip')
      .select('trip')
      .where('trip.status = :status', { status: 'active' })
      .andWhere('trip.date >= :now', { now: new Date() });

    if (departure) {
      qb.andWhere('LOWER(trip.departure) = :departure', {
        departure: departure.trim().toLowerCase(),
      });
    }

    if (destination) {
      qb.andWhere('LOWER(trip.destination) = :destination', {
        destination: destination.trim().toLowerCase(),
      });
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      qb.andWhere('trip.date BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    }

    if (minSeats !== undefined) {
      qb.andWhere('(trip.seats - trip.seatsBooked) >= :minSeats', { minSeats });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('trip.price <= :maxPrice', { maxPrice });
    }


    // Cursor pagination setup
    let afterSortValue: any = undefined;
    let afterId: number | undefined = undefined;
    if (after) {
      const decoded = this.decodeCursor(after);
      afterSortValue = decoded.v;
      afterId = decoded.id;
      if (sortBy === TripSortBy.DATE) {
        afterSortValue = new Date(afterSortValue);
      }
    }

    // Dynamic sorting
    if (sortBy === TripSortBy.DRIVER_RATING) {
      qb.leftJoinAndSelect('trip.driver', 'driver');
      qb.orderBy('driver.rating', sortOrder);
    } else {
      qb.orderBy(`trip.${sortBy}`, sortOrder);
    }

    qb.addOrderBy('trip.id', 'ASC');

    // Apply cursor comparison
    if (after) {
      const sortOperator = sortOrder === 'ASC' ? '>' : '<';
      if (sortBy === TripSortBy.DRIVER_RATING) {
        qb.andWhere(`(
          (driver.rating ${sortOperator} :afterSortValue)
          OR (driver.rating = :afterSortValue AND trip.id > :afterId)
        )`, { afterSortValue, afterId });
      } else {
        qb.andWhere(`(
          (trip.${sortBy} ${sortOperator} :afterSortValue)
          OR (trip.${sortBy} = :afterSortValue AND trip.id > :afterId)
        )`, { afterSortValue, afterId });
      }
    }

    // Fetch one extra to determine hasNextPage
    const trips = await qb.take(first + 1).getMany();
    const hasNextPage = trips.length > first;
    const slicedTrips = hasNextPage ? trips.slice(0, first) : trips;

    const edges = slicedTrips.map((trip) => {
      let sortVal: any = null;
      if (sortBy === TripSortBy.DRIVER_RATING) {
        sortVal = trip.driver?.rating ?? null;
      } else {
        sortVal = trip[sortBy];
      }
      return {
        node: trip,
        cursor: this.encodeCursor({ v: sortVal, id: trip.id }),
      };
    });

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      },
    };
  }


  async getTripsStats(driverId: number) {
    const trips = await this.tripRepo.find({ where: { driverId } });

    return {
      totalTrips: trips.length,
      activeTrips: trips.filter((t) => t.status === 'active').length,
      completedTrips: trips.filter((t) => t.status === 'completed').length,
      cancelledTrips: trips.filter((t) => t.status === 'cancelled').length,
      totalSeats: trips.reduce((sum, t) => sum + t.seats, 0),
    };
  }

  async getTripsByStatus(status: string) {
    return this.tripRepo.find({
      where: { status },
      order: { date: 'ASC' },
    });
  }

  async tripsNearDate(date: string, rangeDays: number) {
    const center = new Date(date);
    const from = new Date(center);
    from.setDate(from.getDate() - rangeDays);
    const to = new Date(center);
    to.setDate(to.getDate() + rangeDays);
    to.setHours(23, 59, 59, 999); // Set to end of day

    return this.tripRepo
      .createQueryBuilder('trip')
      .where('trip.status = :status', { status: 'active' })
      .andWhere('trip.date BETWEEN :from AND :to', { from, to })
      .orderBy('trip.date', 'ASC')
      .getMany();
  }


  // CURSOR HELPERS

  private encodeCursor(payload: { v: any; id: number }): string {
    try {
      return Buffer.from(JSON.stringify(payload)).toString('base64');
    } catch (e) {
      throw new BadRequestException('Unable to encode cursor');
    }
  }

  private decodeCursor(cursor: string): { v: any; id: number } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed == null || typeof parsed.id !== 'number') {
        throw new Error('Invalid cursor payload');
      }
      return { v: parsed.v, id: parsed.id };
    } catch (e) {
      throw new BadRequestException('Invalid cursor');
    }
  }

  async countCompletedTripsByDriver(driverId: number): Promise<number> {
    return this.tripRepo.count({
      where: { driverId, status: 'completed' },
    });
  }

  async getAllDriversTripCounts(): Promise<{ driverId: number; count: number }[]> {
    const result = await this.tripRepo
      .createQueryBuilder('trip')
      .select('trip.driverId', 'driverId')
      .addSelect('COUNT(*)', 'count')
      .where('trip.status = :status', { status: 'completed' })
      .groupBy('trip.driverId')
      .getRawMany();

    return result.map(r => ({ driverId: r.driverId, count: parseInt(r.count) }));
  }

}