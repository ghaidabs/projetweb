import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  departure: string;

  @Column()
  destination: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column()
  seats: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'active' })
  status: string;

  @Column()
  driverId: number;

  @ManyToOne(() => User, (user) => user.trips, { eager: false })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  carModel: string;

  @Column({ default: 0 })
  seatsBooked: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // // Relations
  // @OneToMany(() => Booking, (booking) => booking.trip, { cascade: true })
  // bookings: Booking[];
}
