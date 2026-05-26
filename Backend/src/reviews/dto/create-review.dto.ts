import { IsInt, IsOptional, IsString, Min, Max, IsEnum, IsArray } from 'class-validator';
import { ReviewTag } from '../enums/review-tag.enum';

export class CreateReviewDto {

  @IsInt()
  tripId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ReviewTag, { each: true })
  tags?: ReviewTag[];
}