import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PubSub } from 'graphql-subscriptions';
import { SHARED_PUBSUB } from '../common/pubsub/pubsub.module';

export const TOPIC_BOOKING_CONFIRMED = 'bookingConfirmed';
export const TOPIC_BOOKING_CANCELED = 'bookingCanceled';
export const TOPIC_BOOKING_REJECTED = 'bookingRejected';
//already done 
export const TOPIC_TRIP_CANCELLED = 'tripCancelled';

@Injectable()
export class NotificationsListener {
    private readonly logger = new Logger(NotificationsListener.name);

    constructor(
        @Inject(SHARED_PUBSUB)
        private readonly pubSub: PubSub,
    ) { }

    @OnEvent('booking.confirmed')
    async handleBookingConfirmed(payload: {
        bookingId: number;
        passengerId: number;
        tripId: number;
    }) {
        this.logger.log(`Booking #${payload.bookingId} confirmed → pushing subscription`);
        await this.pubSub.publish(TOPIC_BOOKING_CONFIRMED, {
            bookingConfirmed: payload,
        });
    }

    @OnEvent('trip.cancelled')
    async handleTripCancelled(payload: { tripId: number; reason: string }) {
        this.logger.log(`Trip #${payload.tripId} cancelled → pushing subscription`);
        await this.pubSub.publish(TOPIC_TRIP_CANCELLED, {
            tripCancelled: payload,
        });
    }
}