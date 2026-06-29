import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tutor } from '../../users/entities/tutor.entity';
import { Student } from '../../users/entities/student.entity';
import { ClassRequest } from './class-request.entity';
import { Subject } from '../../subjects/subject.entity';
import { User } from '../../users/entities/user.entity';

export enum ClassStatus {
  ACTIVE = 'active',
  CANCELLATION_REQUESTED = 'cancellation_requested',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor!: Tutor;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @OneToOne(() => ClassRequest)
  @JoinColumn({ name: 'request_id' })
  request!: ClassRequest;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User; // Staff tạo lớp

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'suspended_by' })
  suspendedBy!: User | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string;

  @Column({
    name: 'fee_per_session',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  feePerSession!: number;

  @Column({ name: 'total_sessions', type: 'int', nullable: true })
  totalSessions!: number;

  @Column({ type: 'varchar', length: 50, default: ClassStatus.ACTIVE })
  status!: ClassStatus;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({
    name: 'cancellation_requested_by',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cancellationRequestedBy!: string; // 'tutor' | 'student'

  @Column({
    name: 'cancellation_reason',
    type: 'text',
    nullable: true,
  })
  cancellationReason!: string;

  @Column({
    name: 'cancellation_requested_at',
    type: 'timestamp',
    nullable: true,
  })
  cancellationRequestedAt!: Date;
}
