import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TripMatchedAlertPayload {
  @Field(() => Int)
  tripId: number;

  @Field()
  departure: string;

  @Field()
  destination: string;

  @Field()
  date: Date;
}

@ObjectType()
export class BookingConfirmedPayload {
  @Field(() => Int)
  bookingId: number;

  @Field(() => Int)
  passengerId: number;

  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class TripCancelledPayload {
  @Field(() => Int)
  tripId: number;

  @Field()
  reason: string;
}