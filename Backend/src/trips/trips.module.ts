import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { User } from 'src/users/entities/user.entity';
import { PassengerAlert } from './entities/passenger-alert.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripsResolver } from './trips.resolvers';
import { DriverLoader } from './driver.loader';
import { TripCreatedListener } from './trip-created.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, User, PassengerAlert, Booking])],
  controllers: [TripsController],
  providers: [
    TripsService,
    TripsResolver,
    DriverLoader,
    TripCreatedListener
  ],
  exports: [TripsService],
})
export class TripsModule { }