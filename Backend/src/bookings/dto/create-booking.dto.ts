// src/bookings/dto/create-booking.dto.ts
import { IsInt, IsPositive } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsPositive()
  tripId: number;
}