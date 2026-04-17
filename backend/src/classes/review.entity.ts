import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Unique,
} from 'typeorm';
import { Class } from './class.entity';
import { Student } from '../users/entities/student.entity';
import { Tutor } from '../users/entities/tutor.entity';

@Entity('reviews')
@Unique(['student', 'class']) // Mỗi học viên chỉ review 1 lần/lớp
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor!: Tutor;

  @Column({ type: 'int' })
  rating!: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}