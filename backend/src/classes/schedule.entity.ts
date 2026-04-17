import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Class } from './class.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @Column({ name: 'day_of_week', type: 'varchar', length: 10 })
  dayOfWeek!: string; // 'Mon' | 'Tue' | ...

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'session_date', type: 'date', nullable: true })
  sessionDate!: Date;

  @Column({ name: 'session_status', type: 'varchar', length: 20, default: SessionStatus.SCHEDULED })
  sessionStatus!: SessionStatus;

  @Column({ type: 'text', nullable: true })
  note!: string;
}