import { Trip } from 'src/trips/entities/trip.entity';
import {  Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  passengerId: number;

  @Column()
  tripId: number;

  @ManyToOne(() => Trip, { eager: false, nullable: false })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column({ default: 'confirmed' })
  status: string;

  @Column({ nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}