import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Tutor } from '../users/entities/tutor.entity';
import { Subject } from '../subjects/subject.entity';

@Entity('tutor_subjects')
@Unique(['tutor', 'subject'])
export class TutorSubject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tutor, { eager: true })
  @JoinColumn({ name: 'tutor_id' })
  tutor!: Tutor;

  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;

  @Column({ name: 'proficiency_level', type: 'varchar', length: 50, nullable: true })
  proficiencyLevel!: string; // 'Co ban' | 'Nang cao' | 'Chuyen sau'

  @Column({ name: 'years_experience', type: 'int', nullable: true })
  yearsExperience!: number;
}