import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerAlert } from 'src/trips/entities/passenger-alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(PassengerAlert)
    private readonly alertRepo: Repository<PassengerAlert>,
  ) {}

  async createAlert(passengerId: number, dto: CreateAlertDto) {
    const alertDate = dto.date ? new Date(dto.date) : new Date();

    const alert = this.alertRepo.create({
      passengerId,
      departure: dto.departure,
      destination: dto.destination,
      date: alertDate,
    });

    return this.alertRepo.save(alert);
  }

  async getAlerts(passengerId: number) {
    return this.alertRepo.find({
      where: { passengerId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteAlert(alertId: number, passengerId: number) {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    if (alert.passengerId !== passengerId) {
      throw new ForbiddenException('Pas ton alerte');
    }

    await this.alertRepo.delete(alertId);
    return { success: true };
  }
}
