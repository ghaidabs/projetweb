import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Badge } from '../enums/badge.enum';

@Entity()
export class DriverBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  driverId: number;

  @Column({ type: 'varchar' })
  badge: Badge;

  @CreateDateColumn()
  unlockedAt: Date;
}