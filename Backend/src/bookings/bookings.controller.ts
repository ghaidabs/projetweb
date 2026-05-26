import {Controller, Post, Delete,Patch, Get,Param, Body, ParseIntPipe, UseGuards, Req} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  book(@Body() dto: CreateBookingDto,@Req() request: any) {
    const passengerId = request.user.id;
    return this.bookingsService.bookTrip(passengerId, dto.tripId);
  }

  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number,@Req() request: any) {
    const passengerId = request.user.id;
    return this.bookingsService.cancelBooking(id, passengerId);
  }
  // Conducteur confirme une réservation
    @Patch(':id/confirm')
    confirm(@Param('id', ParseIntPipe) id: number,@Req() request: any) {
    const driverId = request.user.id;
    return this.bookingsService.confirmBooking(id, driverId);
    }

    // Conducteur refuse une réservation
    @Patch(':id/reject')
    reject(@Param('id', ParseIntPipe) id: number,@Req() request: any) {
    const driverId = request.user.id;
    return this.bookingsService.rejectBooking(id, driverId);
    }

    // Conducteur voit les demandes en attente sur son trajet
    @Get('trip/:tripId/pending')
    getPending(@Param('tripId', ParseIntPipe) tripId: number,@Req() request: any) {
    const driverId = request.user.id;
    return this.bookingsService.getPendingBookingsForTrip(tripId, driverId);
    }
}