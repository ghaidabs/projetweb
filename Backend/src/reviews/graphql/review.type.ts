import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ReviewTag } from '../enums/review-tag.enum';

@ObjectType()
export class ReviewType {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [ReviewTag], { nullable: true })
  tags?: ReviewTag[];

  @Field(() => Int, { nullable: true })
  passengerId?: number; // only visible to admin

  @Field()
  createdAt: Date;
}