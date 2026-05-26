import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index(['userId', 'isRevoked'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  userId: number;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;
}
