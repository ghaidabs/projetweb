import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAlertDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  departure?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  destination?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value?.trim())
  date?: string;
}