import {
  IsString,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  departure: string;

  @IsString()
  destination: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  seats: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  carModel?: string;
}
