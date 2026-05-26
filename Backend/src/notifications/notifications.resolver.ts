import { Resolver, Subscription, Args, Int } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { SHARED_PUBSUB } from '../common/pubsub/pubsub.module';
import {
    TripMatchedAlertPayload,
    BookingConfirmedPayload,
    TripCancelledPayload,
} from './graphql/notification.types';
import {
    TOPIC_BOOKING_CONFIRMED,
    TOPIC_TRIP_CANCELLED,
} from './notification.listener';
import { TOPIC_TRIP_MATCHED_ALERT } from '../trips/trip-created.listener';

@Resolver()
export class NotificationsResolver {
    constructor(
        @Inject(SHARED_PUBSUB)
        private readonly pubSub: PubSub,
    ) { }

    // Subscription 1: new trip matches passenger's saved alert
    @Subscription(() => TripMatchedAlertPayload, {
        filter: (payload, variables) => {
            const trip = payload.tripMatchedAlert.trip;
            if (variables.from && trip.departure?.toLowerCase() !== variables.from.toLowerCase())
                return false;
            if (variables.to && trip.destination?.toLowerCase() !== variables.to.toLowerCase())
                return false;
            return true;
        },
        resolve: (payload) => ({
            tripId: payload.tripMatchedAlert.tripId,
            departure: payload.tripMatchedAlert.trip.departure,
            destination: payload.tripMatchedAlert.trip.destination,
            date: payload.tripMatchedAlert.trip.date,
        }),
    })
    tripCreated(
        @Args('from', { nullable: true }) from?: string,
        @Args('to', { nullable: true }) to?: string,
    ) {
        return this.pubSub.asyncIterableIterator(TOPIC_TRIP_MATCHED_ALERT);
    }

    // Subscription 2: passenger gets notified when booking is confirmed
    @Subscription(() => BookingConfirmedPayload, {
        filter: (payload, variables) =>
            payload.bookingConfirmed.passengerId === variables.userId,
    })
    bookingConfirmed(
        @Args('userId', { type: () => Int }) userId: number,
    ) {
        return this.pubSub.asyncIterableIterator(TOPIC_BOOKING_CONFIRMED);
    }

    // Subscription 3: passenger gets notified when their trip is cancelled
    @Subscription(() => TripCancelledPayload, {
        filter: (payload, variables) =>
            payload.tripCancelled.tripId === variables.userId,
    })
    tripCancelled(
        @Args('userId', { type: () => Int }) userId: number,
    ) {
        return this.pubSub.asyncIterableIterator(TOPIC_TRIP_CANCELLED);
    }
}