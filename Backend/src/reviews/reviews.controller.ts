import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Sse, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { filter, from, fromEvent, map, Observable, Subject, switchMap } from 'rxjs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';


@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService, private eventEmitter: EventEmitter2) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  submitReview(@Body() body: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.submitReview({ ...body, passengerId: user.id });
  }

  @Get('reviews/driver/:id')
  getDriverReviews(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getDriverReviews(id);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: User
  ) {
    return this.reviewsService.updateReview(id, dto, user.id);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  deleteReview(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(id, user.id);
  }

  @Get('trips/:id/reviews')
  getTripReviews(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getTripReviews(id);
  }

  @Sse('driver/:id/live')
  streamDriverStats(@Param('id', ParseIntPipe) driverId: number) {
    return fromEvent(this.eventEmitter, 'review.submitted').pipe(
    filter((payload: any) => payload.driverId === driverId),
    map((payload: any) => ({type:'review.submitted', data: { averageRating: payload.averageRating } })),
    );
  }

  @Sse('passenger/:id/reviewnotifications')
  streamPassengerNotifications(@Param('id', ParseIntPipe) passengerId: number): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'trip.completed').pipe(
      filter((payload: any) => payload.passengerIds.includes(passengerId)),
      map((payload: any) => ({
        type: 'trip.completed',
        data: {
          tripId: payload.tripId,
          message: 'Votre trajet est terminé, pensez à évaluer votre conducteur !',
          driverId: payload.driverId,
        },
      } as MessageEvent)),
    );

    }

  @Sse('driver/:id/badges/live')
  streamBadgeUnlocks(@Param('id', ParseIntPipe) driverId: number): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'badge.unlocked').pipe(
      filter((payload: any) => payload.driverId === driverId),
      map((payload: any) => ({
        type: 'badge.unlocked',
        data: {
          badges: payload.badges,
          message: `🏆 Nouveau badge débloqué !`,
        },
      } as MessageEvent)),
    );
  }

@Post('driver/:id/recompute-badges')
recomputeBadges(@Param('id', ParseIntPipe) driverId: number) {
  return this.reviewsService.computeAndSaveBadges(driverId);
}
  
}
