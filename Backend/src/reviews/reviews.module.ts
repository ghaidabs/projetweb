import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Review } from './entities/review.entity';
import { ReviewsResolver } from './reviews.resolver';
import { Trip } from '../trips/entities/trip.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TripsModule } from 'src/trips/trips.module';
import { DriverBadge } from './entities/driver-badge.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Trip, Booking, DriverBadge]),TripsModule, UsersModule,],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsResolver],
})
export class ReviewsModule {}
