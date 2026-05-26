import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Trip } from '../trips/entities/trip.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsResolver } from './bookings.resolver';
import { TripCancelledListener } from './trip-cancelled.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Trip]),
  ],
  providers: [BookingsService, BookingsResolver, TripCancelledListener],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}