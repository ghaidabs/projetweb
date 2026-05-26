import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingsService } from './bookings.service';

@Injectable()
export class TripCancelledListener {
  private readonly logger = new Logger(TripCancelledListener.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @OnEvent('trip.cancelled')
  async handleTripCancelled(payload: { tripId: number; reason: string }) {
    this.logger.log(
      `Trip #${payload.tripId} annulé — cascade sur les réservations`,
    );
    await this.bookingsService.cancelAllBookingsForTrip(
      payload.tripId,
      payload.reason,
    );
  }
}