import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Student } from './entities/student.entity';
import { Tutor, ApprovalStatus } from './entities/tutor.entity';
import { Subject } from '../subjects/subject.entity';
import { TutorSubject } from '../tutors/tutor-subject.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Tutor) private tutorsRepository: Repository<Tutor>,
    @InjectRepository(Subject) private subjectsRepository: Repository<Subject>,
    @InjectRepository(TutorSubject) private tutorSubjectsRepository: Repository<TutorSubject>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findTutorByUserId(userId: string): Promise<Tutor | null> {
    return this.tutorsRepository.findOne({ where: { user: { id: userId } } });
  }

  private async getOrCreateRole(roleName: string): Promise<Role> {
    let role = await this.rolesRepository.findOne({ where: { name: roleName } });
    if (!role) {
      role = this.rolesRepository.create({ name: roleName, description: `System generated ${roleName} role` });
      await this.rolesRepository.save(role);
    }
    return role;
  }

  async createStudent(userData: Partial<User>, studentData: Partial<Student> = {}): Promise<User> {
    if (!userData.email) throw new ConflictException('Email không được để trống');
    const existing = await this.findByEmail(userData.email);
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const role = await this.getOrCreateRole('student');

    const user = this.usersRepository.create();
    Object.assign(user, { ...userData, role, isActive: true });
    const savedUser = await this.usersRepository.save(user);

    const student = this.studentsRepository.create();
    Object.assign(student, { ...studentData, user: savedUser });
    await this.studentsRepository.save(student);

    return savedUser;
  }

  async createTutor(userData: Partial<User>, tutorData: Partial<Tutor>, subjectNames: string[] = []): Promise<User> {
    if (!userData.email) throw new ConflictException('Email không được để trống');
    const existing = await this.findByEmail(userData.email);
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const role = await this.getOrCreateRole('tutor');

    const user = this.usersRepository.create();
    Object.assign(user, { ...userData, role, isActive: true });
    const savedUser = await this.usersRepository.save(user);

    const tutor = this.tutorsRepository.create();
    Object.assign(tutor, { ...tutorData, user: savedUser, approvalStatus: ApprovalStatus.PENDING });
    const savedTutor = await this.tutorsRepository.save(tutor);

    // Map subjects
    for (const name of subjectNames) {
      let subject = await this.subjectsRepository.findOne({ where: { name } });
      if (!subject) {
        subject = this.subjectsRepository.create();
        Object.assign(subject, { name, isActive: true });
        await this.subjectsRepository.save(subject);
      }
      
      const tutorSubject = this.tutorSubjectsRepository.create();
      Object.assign(tutorSubject, { tutor: savedTutor, subject });
      await this.tutorSubjectsRepository.save(tutorSubject);
    }

    return savedUser;
  }
}