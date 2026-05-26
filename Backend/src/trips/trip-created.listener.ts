import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { PassengerAlert } from './entities/passenger-alert.entity';
import { Trip } from './entities/trip.entity';
import { SHARED_PUBSUB } from '../common/pubsub/pubsub.module';

export const TOPIC_TRIP_MATCHED_ALERT = 'tripMatchedAlert';

@Injectable()
export class TripCreatedListener {
  private readonly logger = new Logger(TripCreatedListener.name);

  constructor(
    @InjectRepository(PassengerAlert)
    private readonly alertRepo: Repository<PassengerAlert>,

    @Inject(SHARED_PUBSUB)
    private readonly pubSub: PubSub,
  ) { }


  @OnEvent('trip.created')
  async handleTripCreated(payload: { tripId: number; trip: Trip }) {
    const { tripId, trip } = payload;

    const matchedAlerts = await this.findMatchingAlerts(trip);

    if (matchedAlerts.length === 0) {
      this.logger.debug(`Trip #${tripId}: no matching passenger alerts`);
      return;
    }

    const matchedAlertIds = matchedAlerts.map((a) => a.id);
    this.logger.log(
      `Trip #${tripId}: matched ${matchedAlertIds.length} passenger alerts`,
    );

    await this.pubSub.publish(TOPIC_TRIP_MATCHED_ALERT, {
      tripMatchedAlert: {
        tripId,
        trip,
        matchedAlertIds,
      },
    });
  }

  private async findMatchingAlerts(trip: Trip): Promise<PassengerAlert[]> {
    const qb = this.alertRepo.createQueryBuilder('alert');

    qb.andWhere(
      '(alert.departure IS NULL OR LOWER(alert.departure) = LOWER(:departure))',
      { departure: trip.departure },
    );

    qb.andWhere(
      '(alert.destination IS NULL OR LOWER(alert.destination) = LOWER(:destination))',
      { destination: trip.destination },
    );

    qb.andWhere(
      '(alert.date IS NULL OR DATE(alert.date) = DATE(:tripDate))',
      { tripDate: trip.date },
    );

    return qb.getMany();
  }
}
