import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

export enum NotificationType {
  NEW_REQUEST = 'new_request',
  CLASS_CONFIRMED = 'class_confirmed',
  SCHEDULE_CHANGED = 'schedule_changed',
  TUTOR_APPROVED = 'tutor_approved',
  TUTOR_REJECTED = 'tutor_rejected',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: NotificationType;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}