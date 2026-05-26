import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Trip } from 'src/trips/entities/trip.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: string;

  // Champs Passenger
  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Trip, (trip) => trip.driver)
  trips: Trip[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[];

  // Note: Booking relation is managed from Booking.entity (inverse side)
  // To avoid circular dependencies, we use lazy loading if needed
}
