import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BookingType {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  passengerId: number;

  @Field(() => Int)
  tripId: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  cancelReason: string;

  @Field()
  createdAt: Date;
}