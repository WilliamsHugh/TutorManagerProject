import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../users/entities/student.entity';
import { Subject } from '../../subjects/subject.entity';
import { User } from '../../users/entities/user.entity';
import { Tutor } from '../../users/entities/tutor.entity';

export enum RequestStatus {
  PENDING = 'pending',
  PROPOSED = 'proposed',
  PROCESSING = 'processing',
  MATCHED = 'matched',
  CANCELLED = 'cancelled',
}

@Entity('class_requests')
export class ClassRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;

  @ManyToOne(() => Tutor, { nullable: true })
  @JoinColumn({ name: 'preferred_tutor_id' })
  preferredTutor?: Tutor;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'handled_by' })
  handledBy!: User;

  @Column({
    name: 'preferred_area',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  preferredArea!: string;

  @Column({
    name: 'preferred_schedule',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  preferredSchedule!: string;

  @Column({ type: 'text', nullable: true })
  requirements!: string;

  @Column({
    name: 'proposed_fee',
    type: 'decimal',
    precision: 10,
    scale: 0,
    nullable: true,
  })
  proposedFee!: number;

  @Column({
    name: 'proposed_sessions',
    type: 'int',
    nullable: true,
  })
  proposedSessions!: number;

  @Column({
    name: 'proposed_at',
    type: 'timestamp',
    nullable: true,
  })
  proposedAt!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
