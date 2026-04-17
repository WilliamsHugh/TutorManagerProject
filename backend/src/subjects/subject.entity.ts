import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'grade_level', type: 'varchar', length: 50, nullable: true })
  gradeLevel!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}