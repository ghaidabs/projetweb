import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { DriverAnalytics } from './driver-analytics.type';
import { Badge } from '../enums/badge.enum';

@ObjectType()
export class RatingDistribution {
  @Field(() => Int)
  stars: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class TagStat {
  @Field()
  tag: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class DriverStats {
  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  totalReviews: number;

  @Field(() => Int, { nullable: true })
  totalTrips?: number;

  @Field(() => [RatingDistribution])
  distribution: RatingDistribution[];

  @Field(() => [TagStat])
  topTags: TagStat[];

  @Field(() => DriverAnalytics)
  analytics: DriverAnalytics;
  
  @Field(() => [Badge])
  badges: Badge[];
}