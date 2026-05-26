// ../seed-bookings.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Repository } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingRepo = app.get<Repository<Booking>>(getRepositoryToken(Booking));

  await bookingRepo.save([
    { tripId: 1, passengerId: 2, status: 'confirmed' },
    { tripId: 1, passengerId: 3, status: 'confirmed' },
  ]);

  console.log('Bookings seeded ✅');
  await app.close();
}

seed();