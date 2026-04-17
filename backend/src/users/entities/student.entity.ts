import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel!: string;

  @Column({ name: 'school_name', type: 'varchar', length: 255, nullable: true })
  schoolName!: string;

  @Column({ name: 'parent_name', type: 'varchar', length: 255, nullable: true })
  parentName!: string;

  @Column({ name: 'parent_phone', type: 'varchar', length: 20, nullable: true })
  parentPhone!: string;

  @Column({ name: 'parent_email', type: 'varchar', length: 255, nullable: true })
  parentEmail!: string;
}