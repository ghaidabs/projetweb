import { Controller, Post, Delete, Get, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    createAlert(@Req() req: any, @Body() dto: CreateAlertDto) {
        return this.notificationsService.createAlert(req.user.id, dto);
    }

    @Delete(':id')
    deleteAlert(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.deleteAlert(id, req.user.id);
    }

    @Get()
    getMyAlerts(@Req() req: any) {
        return this.notificationsService.getMyAlerts(req.user.id);
    }
}