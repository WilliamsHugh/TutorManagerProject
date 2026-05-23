import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { Tutor } from '../../users/entities/tutor.entity';

export enum ProgressRating {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

@Entity('learning_reports')
export class LearningReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Class, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @ManyToOne(() => Tutor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_id' })
  tutor!: Tutor;

  @Column({ name: 'report_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportDate!: Date;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ type: 'text', nullable: true })
  homework!: string;

  @Column({ name: 'progress_rating', type: 'text', nullable: true })
  progressRating!: string; // Khớp với TEXT trong bảng SQL của bạn

  @Column({ name: 'attendance_status', type: 'boolean', default: true })
  attendanceStatus!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}