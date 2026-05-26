import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengerAlert } from '../trips/entities/passenger-alert.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsListener } from './notification.listener';
import { AlertsController } from './alerts.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PassengerAlert])],
    providers: [NotificationsService, NotificationsResolver, NotificationsListener],
    controllers: [AlertsController],
})
export class NotificationsModule { }