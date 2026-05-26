import { IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  departure: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
