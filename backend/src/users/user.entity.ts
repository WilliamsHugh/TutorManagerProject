import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

export enum TutorStatus {
  PENDING = 'pending',   // Chờ duyệt
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  // Tutor-specific fields
  @Column({ nullable: true })
  education!: string;

  @Column({ nullable: true, type: 'text' })
  experience!: string;

  @Column({ type: 'simple-array', nullable: true })
  subjects!: string[];

  @Column({ nullable: true })
  certificateUrl!: string;

  @Column({
    type: 'enum',
    enum: TutorStatus,
    nullable: true,
  })
  tutorStatus!: TutorStatus;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}