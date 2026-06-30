import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('tutors')
export class Tutor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: Date;

  @Column({
    name: 'id_card_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  idCardNumber!: string;

  @Column({
    name: 'education_level',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  educationLevel!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  major!: string;

  @Column({ type: 'text', nullable: true })
  experience!: string;

  @Column({ name: 'available_areas', type: 'text', nullable: true })
  availableAreas!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string;

  @Column({ name: 'cv_url', type: 'varchar', length: 500, nullable: true })
  cvUrl!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university!: string;

  @Column({
    name: 'graduation_year',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  graduationYear!: string;

  @Column({
    name: 'approval_status',
    type: 'varchar',
    length: 20,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus!: ApprovalStatus;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy!: User;
}
