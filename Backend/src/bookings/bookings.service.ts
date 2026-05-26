import {Injectable, NotFoundException,BadRequestException, ForbiddenException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Booking } from './entities/booking.entity';
import { Trip } from '../trips/entities/trip.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async bookTrip(passengerId: number, tripId: number): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trip = await queryRunner.manager.findOne(Trip, {
        where: { id: tripId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!trip)
        throw new NotFoundException('Trajet introuvable');
      if (trip.status !== 'active')
        throw new BadRequestException('Trajet non disponible');
      if (trip.driverId === passengerId)
        throw new BadRequestException('Tu ne peux pas réserver ton propre trajet');
      if (trip.seats - trip.seatsBooked <= 0)
        throw new BadRequestException('Plus de places disponibles');

      const existing = await queryRunner.manager.findOne(Booking, {
        where: { passengerId, tripId, status: 'confirmed' },
      });
      if (existing)
        throw new BadRequestException('Tu as déjà réservé ce trajet');

      const booking = queryRunner.manager.create(Booking, {
        passengerId,
        tripId,
        status: 'pending',
      });
      const saved = await queryRunner.manager.save(booking);

      await queryRunner.manager.increment(Trip, { id: tripId }, 'seatsBooked', 1);
      await queryRunner.commitTransaction();

      return saved;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelBooking(bookingId: number, passengerId: number): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: { id: bookingId },
      });

      if (!booking)
        throw new NotFoundException('Réservation introuvable');
      if (booking.passengerId !== passengerId)
        throw new ForbiddenException('Pas ta réservation');
      if (booking.status === 'cancelled')
        throw new BadRequestException('Déjà annulée');

      booking.status = 'cancelled';
      booking.cancelReason = 'Annulée par le passager';
      await queryRunner.manager.save(booking);

      await queryRunner.manager.decrement(
        Trip, { id: booking.tripId }, 'seatsBooked', 1,
      );
      await queryRunner.commitTransaction();

      this.eventEmitter.emit('booking.cancelled', {
        bookingId,
        passengerId,
        tripId: booking.tripId,
      });

      return booking;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyBookings(passengerId: number): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { passengerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingById(id: number): Promise<Booking | null> {
    return this.bookingRepo.findOne({ where: { id } });
  }

  async cancelAllBookingsForTrip(tripId: number, reason: string): Promise<void> {
    const bookings = await this.bookingRepo.find({
      where: { tripId, status: 'confirmed' },
    });

    if (bookings.length === 0) return;

    for (const booking of bookings) {
      booking.status = 'cancelled';
      booking.cancelReason = reason;
    }

    await this.bookingRepo.save(bookings);
    await this.tripRepo.update({ id: tripId }, { seatsBooked: 0 });

    this.eventEmitter.emit('bookings.bulk_cancelled', {
      tripId,
      passengerIds: bookings.map((b) => b.passengerId),
      reason,
    });
  }
  async confirmBooking(bookingId: number, driverId: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });

    if (!booking)
        throw new NotFoundException('Réservation introuvable');
    if (booking.status !== 'pending')
        throw new BadRequestException('Réservation déjà traitée');

    const trip = await this.tripRepo.findOne({ where: { id: booking.tripId } });
    if (!trip)
        throw new NotFoundException('Trajet introuvable');
    if (trip.driverId !== driverId)
        throw new ForbiddenException('Tu n\'es pas le conducteur de ce trajet');

    booking.status = 'confirmed';
    const saved = await this.bookingRepo.save(booking);

    this.eventEmitter.emit('booking.confirmed', {
        bookingId: saved.id,
        passengerId: booking.passengerId,
        tripId: booking.tripId,
    });

    return saved;
    }

    async rejectBooking(bookingId: number, driverId: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });

    if (!booking)
        throw new NotFoundException('Réservation introuvable');
    if (booking.status !== 'pending')
        throw new BadRequestException('Réservation déjà traitée');

    const trip = await this.tripRepo.findOne({ where: { id: booking.tripId } });
    if (!trip)
        throw new NotFoundException('Trajet introuvable');
    if (trip.driverId !== driverId)
        throw new ForbiddenException('Tu n\'es pas le conducteur de ce trajet');

    booking.status = 'rejected';
    booking.cancelReason = 'Refusée par le conducteur';
    const saved = await this.bookingRepo.save(booking);

    await this.tripRepo.decrement({ id: booking.tripId }, 'seatsBooked', 1);

    this.eventEmitter.emit('booking.rejected', {
        bookingId: saved.id,
        passengerId: booking.passengerId,
        tripId: booking.tripId,
    });

    return saved;
    }

    async getPendingBookingsForTrip(tripId: number, driverId: number): Promise<Booking[]> {
    const trip = await this.tripRepo.findOne({ where: { id: tripId } });
    if (!trip)
        throw new NotFoundException('Trajet introuvable');
    if (trip.driverId !== driverId)
        throw new ForbiddenException('Tu n\'es pas le conducteur de ce trajet');

    return this.bookingRepo.find({
        where: { tripId, status: 'pending' },
        order: { createdAt: 'ASC' },
    });
    }
}