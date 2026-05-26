import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';

export enum Trend {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

registerEnumType(Trend, { name: 'Trend' });

@ObjectType()
export class MonthlyAverage {
  @Field()
  month: string;

  @Field(() => Float)
  avg: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class DriverAnalytics {
  @Field(() => Float)
  lastTenAverage: number;

  @Field(() => Float)
  positiveRate: number;

  @Field(() => Trend)
  trend: Trend;

  @Field(() => [MonthlyAverage])
  monthlyAverages: MonthlyAverage[];
}