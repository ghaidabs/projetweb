import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(@Body() dto: CreateTripDto, @CurrentUser() user: User) {
    return this.tripsService.createTrip(user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTripDto,
    @CurrentUser() user: User,
  ) {
    return this.tripsService.updateTrip(id, user.id, dto);
  }

  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.tripsService.cancelTrip(id, user.id);
  }

  @Get('mine')
  getMyTrips(@CurrentUser() user: User) {
    return this.tripsService.getMyTrips(user.id);
  }

  @Patch(':id/complete')
  completeTrip(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.tripsService.completeTrip(id, user.id);
  }
}