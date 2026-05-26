import { InputType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TripSortBy {
  DATE = 'date',
  PRICE = 'price',
  DRIVER_RATING = 'driverRating',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(TripSortBy, { name: 'TripSortBy' });
registerEnumType(SortOrder, { name: 'SortOrder' });

@InputType()
export class SearchTripsInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  departure?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  destination?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  minSeats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Field(() => Float, { nullable: true })
  maxPrice?: number;

  @IsOptional()
  @IsEnum(TripSortBy)
  @Field(() => TripSortBy, { nullable: true, defaultValue: TripSortBy.DATE })
  sortBy?: TripSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  @Field(() => SortOrder, { nullable: true, defaultValue: SortOrder.ASC })
  sortOrder?: SortOrder;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true, defaultValue: 5 })
  first?: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  after?: string;
}