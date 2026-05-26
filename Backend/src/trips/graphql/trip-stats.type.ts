import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TripStatsType {
  @Field(() => Int)
  totalTrips: number;

  @Field(() => Int)
  activeTrips: number;

  @Field(() => Int)
  completedTrips: number;

  @Field(() => Int)
  cancelledTrips: number;

  @Field(() => Int)
  totalSeats: number;
}