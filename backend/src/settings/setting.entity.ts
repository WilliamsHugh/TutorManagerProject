import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  value!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label!: string;

  @Column({ type: 'varchar', length: 50, default: 'text' })
  type!: string; // 'text', 'number', 'boolean', 'select'

  @Column({ type: 'text', nullable: true })
  options!: string; // JSON string for select type options

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
