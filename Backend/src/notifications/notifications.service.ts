import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerAlert } from '../trips/entities/passenger-alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(PassengerAlert)
        private alertRepo: Repository<PassengerAlert>,
    ) { }

    async createAlert(passengerId: number, dto: CreateAlertDto): Promise<PassengerAlert> {
        const alert = this.alertRepo.create({
            passengerId,
            departure: dto.departure,
            destination: dto.destination,
            date: dto.date ? new Date(dto.date) : undefined,
        });
        return this.alertRepo.save(alert);
    }

    async deleteAlert(alertId: number, passengerId: number): Promise<{ message: string }> {
        const alert = await this.alertRepo.findOne({ where: { id: alertId } });
        if (!alert) throw new NotFoundException('Alerte introuvable');
        if (alert.passengerId !== passengerId)
            throw new ForbiddenException('Pas ton alerte');
        await this.alertRepo.remove(alert);
        return { message: 'Alerte supprimée' };
    }

    async getMyAlerts(passengerId: number): Promise<PassengerAlert[]> {
        return this.alertRepo.find({ where: { passengerId } });
    }
}