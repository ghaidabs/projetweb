import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { ReviewTag } from '../enums/review-tag.enum';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1–5

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: ReviewTag[];
  
  @ManyToOne(() => User)
  passenger: User;


  @Column({ nullable: true })
  passengerId: number; 

  @ManyToOne(() => User)
  driver: User;

  @Column()
  driverId: number;

  @ManyToOne(() => Trip)
  trip: Trip;

  @Column()
  tripId: number;

  @CreateDateColumn()
  createdAt: Date;
}