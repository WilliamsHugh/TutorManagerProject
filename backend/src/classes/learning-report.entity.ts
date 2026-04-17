import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { Tutor } from '../users/entities/tutor.entity';

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

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor!: Tutor;

  @Column({ name: 'report_date', type: 'date' })
  reportDate!: Date;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ type: 'text', nullable: true })
  homework!: string;

  @Column({ name: 'progress_rating', type: 'varchar', length: 20, nullable: true })
  progressRating!: ProgressRating;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}