import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';


@Entity()
export class PassengerAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  passengerId: number;

  @Column({ nullable: true })
  departure?: string;

  @Column({ nullable: true })
  destination?: string;

  @Column({ nullable: true })
  date?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
