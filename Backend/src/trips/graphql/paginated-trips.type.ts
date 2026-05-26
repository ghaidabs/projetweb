import { ObjectType, Field, Int } from '@nestjs/graphql';
import { TripType } from './trip.type';

@ObjectType()
export class TripEdge {
  @Field(() => TripType)
  node: TripType;

  @Field({ description: 'Opaque cursor for this edge' })
  cursor: string;
}

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field({ nullable: true, description: 'Cursor of the last edge in this page' })
  endCursor?: string;
}

@ObjectType()
export class PaginatedTripsType {
  @Field(() => [TripEdge])
  edges: TripEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

}