import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  create(@Body() dto: CreateAlertDto, @CurrentUser() user: User) {
    return this.alertsService.createAlert(user.id, dto);
  }

  @Get()
  getMyAlerts(@CurrentUser() user: User) {
    return this.alertsService.getAlerts(user.id);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.alertsService.deleteAlert(id, user.id);
  }
}
