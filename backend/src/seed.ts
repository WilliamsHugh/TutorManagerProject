import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Student } from './users/entities/student.entity';
import { Tutor, ApprovalStatus } from './users/entities/tutor.entity';
import { Subject } from './subjects/subject.entity';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

import { TutorSubject } from './tutors/tutor-subject.entity';
import { ClassRequest } from './classes/class-request.entity';
import { Class } from './classes/class.entity';
import { Schedule } from './classes/schedule.entity';
import { LearningReport } from './classes/learning-report.entity';
import { Review } from './classes/review.entity';
import { Notification } from './notifications/notification.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: !process.env.DATABASE_URL ? process.env.DB_HOST : undefined,
  port: !process.env.DATABASE_URL ? Number(process.env.DB_PORT) : undefined,
  username: !process.env.DATABASE_URL ? process.env.DB_USERNAME : undefined,
  password: !process.env.DATABASE_URL ? process.env.DB_PASSWORD : undefined,
  database: !process.env.DATABASE_URL ? process.env.DB_NAME : undefined,
  entities: [
    Role, User, Tutor, Student, Subject, TutorSubject, 
    ClassRequest, Class, Schedule, LearningReport, Review, Notification
  ],
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const subjectRepo = dataSource.getRepository(Subject);

  // 1. Seed Roles
  const roles = ['admin', 'staff', 'tutor', 'student'];
  for (const rName of roles) {
    const existing = await roleRepo.findOneBy({ name: rName });
    if (!existing) {
      await roleRepo.save(roleRepo.create({ name: rName, description: `Vai trò ${rName}` }));
      console.log(`Created role: ${rName}`);
    }
  }

  const adminRole = await roleRepo.findOneBy({ name: 'admin' });
  const staffRole = await roleRepo.findOneBy({ name: 'staff' });

  // 2. Seed Admin User
  const adminEmail = 'admin@tutoredu.com';
  const existingAdmin = await userRepo.findOneBy({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123@', 10);
    await userRepo.save(userRepo.create({
      email: adminEmail,
      passwordHash: hashedPassword,
      fullName: 'Hệ thống Admin',
      role: adminRole!,
      isActive: true,
    }));
    console.log('Created Admin user: admin@tutoredu.com / Admin123@');
  }

  // 3. Seed Staff User
  const staffEmail = 'staff@tutoredu.com';
  const existingStaff = await userRepo.findOneBy({ email: staffEmail });
  if (!existingStaff) {
    const hashedPassword = await bcrypt.hash('Staff123@', 10);
    await userRepo.save(userRepo.create({
      email: staffEmail,
      passwordHash: hashedPassword,
      fullName: 'Nhân viên quản lý',
      role: staffRole!,
      isActive: true,
    }));
    console.log('Created Staff user: staff@tutoredu.com / Staff123@');
  }

  // 4. Seed Subjects
  const defaultSubjects = ['Toán', 'Lý', 'Hóa', 'Tiếng Anh', 'Ngữ văn', 'Tin học'];
  for (const sName of defaultSubjects) {
    const existing = await subjectRepo.findOneBy({ name: sName });
    if (!existing) {
      await subjectRepo.save(subjectRepo.create({ name: sName, isActive: true }));
      console.log(`Created subject: ${sName}`);
    }
  }

  console.log('Seeding completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
