import {Resolver, Query, Args, Int, ResolveField, Parent, Context} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { BookingWithTripType } from './graphql/booking-with-trip.type';
import { TripType } from '../trips/graphql/trip.type';
import { Booking } from './entities/booking.entity';
import { Trip } from '../trips/entities/trip.entity';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(GqlAuthGuard)
@Resolver(() => BookingWithTripType)
export class BookingsResolver {
  constructor(
    private readonly bookingsService: BookingsService,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
  ) {}

  @Query(() => [BookingWithTripType])
  myBookings(@Context() context: any) {
    const passengerId = context.req.user.id;
    return this.bookingsService.getMyBookings(passengerId);
  }

  @Query(() => BookingWithTripType, { nullable: true })
  booking(@Args('id', { type: () => Int }) id: number) {
    return this.bookingsService.getBookingById(id);
  }

  // Liaison Booking → Trip
  // Appelé automatiquement par GraphQL pour chaque booking retourné
  @ResolveField('trip', () => TripType, { nullable: true })
  async resolveTrip(@Parent() booking: Booking) {
    return this.tripRepo.findOne({ where: { id: booking.tripId } });
  }

  // Le ResolveField('driver') défini dans TripsResolver
  // s'applique automatiquement sur TripType peu importe d'où il vient —
  // donc Booking → Trip → Driver est résolu sans rien ajouter ici
}