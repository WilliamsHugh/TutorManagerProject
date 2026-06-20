import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tutor } from '../users/entities/tutor.entity';
import { Class } from '../classes/entities/class.entity';

export enum SalaryStatus {
  PENDING = 'pending',       // Chưa thanh toán
  APPROVED = 'approved',     // Đã duyệt, chờ chuyển tiền
  PAID = 'paid',             // Đã thanh toán
  CANCELLED = 'cancelled',   // Đã huỷ
}

@Entity('salary_records')
export class SalaryRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor!: Tutor;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  // --- Thông tin buổi học ---
  @Column({ name: 'session_date', type: 'date' })
  sessionDate!: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 4, scale: 1, default: 2 })
  durationHours!: number;

  // --- Học phí & chia lương ---
  @Column({ name: 'tuition_fee', type: 'decimal', precision: 12, scale: 0 })
  tuitionFee!: number;           // Học phí học viên đóng

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 0.40 })
  commissionRate!: number;       // Tỷ lệ trung tâm giữ (vd: 0.40 = 40%)

  @Column({ name: 'tutor_share', type: 'decimal', precision: 12, scale: 0 })
  tutorShare!: number;           // Tiền gia sư nhận = tuitionFee * (1 - commissionRate)

  @Column({ name: 'center_share', type: 'decimal', precision: 12, scale: 0 })
  centerShare!: number;          // Tiền trung tâm giữ

  // --- Trạng thái thanh toán ---
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: SalaryStatus.PENDING,
  })
  status!: SalaryStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt!: Date;

  @Column({ name: 'note', type: 'text', nullable: true })
  note!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
