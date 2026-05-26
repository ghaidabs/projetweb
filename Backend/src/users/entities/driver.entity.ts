import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Trip } from 'src/trips/entities/trip.entity';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @OneToMany(() => Trip, (trip) => trip.driver)
  trips: Trip[];

  @CreateDateColumn()
  createdAt: Date;
}
