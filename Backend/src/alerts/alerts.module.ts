import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengerAlert } from 'src/trips/entities/passenger-alert.entity';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [TypeOrmModule.forFeature([PassengerAlert])],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
