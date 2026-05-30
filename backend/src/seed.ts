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
import { ClassRequest } from './classes/entities/class-request.entity';
import { Class } from './classes/entities/class.entity';
import { Schedule } from './classes/entities/schedule.entity';
import { LearningReport } from './classes/entities/learning-report.entity';
import { Review } from './classes/entities/review.entity';
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
    Role,
    User,
    Tutor,
    Student,
    Subject,
    TutorSubject,
    ClassRequest,
    Class,
    Schedule,
    LearningReport,
    Review,
    Notification,
  ],
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
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
      await roleRepo.save(
        roleRepo.create({ name: rName, description: `Vai trò ${rName}` }),
      );
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
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        passwordHash: hashedPassword,
        fullName: 'Hệ thống Admin',
        role: adminRole!,
        isActive: true,
      }),
    );
    console.log('Created Admin user: admin@tutoredu.com / Admin123@');
  }

  // 3. Seed Staff User
  const staffEmail = 'staff@tutoredu.com';
  const existingStaff = await userRepo.findOneBy({ email: staffEmail });
  if (!existingStaff) {
    const hashedPassword = await bcrypt.hash('Staff123@', 10);
    await userRepo.save(
      userRepo.create({
        email: staffEmail,
        passwordHash: hashedPassword,
        fullName: 'Nhân viên quản lý',
        role: staffRole!,
        isActive: true,
      }),
    );
    console.log('Created Staff user: staff@tutoredu.com / Staff123@');
  }

  // 4. Seed Subjects
  const defaultSubjects = [
    'Toán học',
    'Vật lí',
    'Hóa học',
    'Tiếng Anh',
    'Ngữ văn',
    'Tin học',
  ];
  for (const sName of defaultSubjects) {
    const existing = await subjectRepo.findOneBy({ name: sName });
    if (!existing) {
      await subjectRepo.save(
        subjectRepo.create({ name: sName, isActive: true }),
      );
      console.log(`Created subject: ${sName}`);
    }
  }

  const tutorRole = await roleRepo.findOneBy({ name: 'tutor' });
  const studentRole = await roleRepo.findOneBy({ name: 'student' });
  const tutorRepo = dataSource.getRepository(Tutor);
  const tutorSubjectRepo = dataSource.getRepository(TutorSubject);
  const studentRepo = dataSource.getRepository(Student);
  const requestRepo = dataSource.getRepository(ClassRequest);
  const classRepo = dataSource.getRepository(Class);

  // 5. Seed Mock Tutors
  const mockTutorsData = [
    {
      email: 'nguyen_van_binh@tutoredu.com',
      fullName: 'Nguyễn Văn Bình',
      phone: '0901222333',
      address: 'Quận 1, TP.HCM',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'ĐH Bách Khoa',
        experience: '2 năm kinh nghiệm dạy kèm môn Toán, Lý cấp 3',
        idCardNumber: '079123456789',
        availableAreas: 'Quận 1, Quận 5',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học', 'Vật lí'],
    },
    {
      email: 'tran_thi_cam@tutoredu.com',
      fullName: 'Trần Thị Cẩm',
      phone: '0902222333',
      address: 'Quận 7, TP.HCM',
      tutor: {
        educationLevel: 'Giáo viên',
        major: 'THPT',
        experience: '5 năm kinh nghiệm giảng dạy môn Toán và Hóa học',
        idCardNumber: '079123456788',
        availableAreas: 'Quận 1, Quận 4, Quận 7',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học', 'Hóa học'],
    },
    {
      email: 'le_minh_dat@tutoredu.com',
      fullName: 'Lê Minh Đạt',
      phone: '0903222333',
      address: 'Quận 10, TP.HCM',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'ĐH Khoa Học Tự Nhiên',
        experience: '1.5 năm kinh nghiệm, rành kèm học sinh trung học',
        idCardNumber: '079123456787',
        availableAreas: 'Quận 3, Quận 10',
        approvalStatus: ApprovalStatus.PENDING,
      },
      subjects: ['Toán học', 'Tin học'],
    },
    {
      email: 'phan_ngoc_ha@tutoredu.com',
      fullName: 'Phan Ngọc Hà',
      phone: '0904222333',
      address: 'Bình Thạnh, TP.HCM',
      tutor: {
        educationLevel: 'Cử nhân',
        major: 'Sư phạm Toán',
        experience: '3 năm kinh nghiệm dạy ôn thi',
        idCardNumber: '079123456786',
        availableAreas: 'Bình Thạnh',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
  ];

  for (const item of mockTutorsData) {
    const existing = await userRepo.findOneBy({ email: item.email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Tutor123@', 10);
      const user = await userRepo.save(
        userRepo.create({
          email: item.email,
          passwordHash: hashedPassword,
          fullName: item.fullName,
          phone: item.phone,
          address: item.address,
          role: tutorRole!,
          isActive: true,
        }),
      );

      const tutor = await tutorRepo.save(
        tutorRepo.create({
          ...item.tutor,
          user,
        }),
      );

      for (const subName of item.subjects) {
        const subject = await subjectRepo.findOneBy({ name: subName });
        if (subject) {
          await tutorSubjectRepo.save(
            tutorSubjectRepo.create({
              tutor,
              subject,
              proficiencyLevel: 'Co ban',
              yearsExperience: 2,
            }),
          );
        }
      }
      console.log(`Seeded tutor: ${item.fullName}`);
    }
  }

  // 6. Seed Mock Students
  const mockStudentsData = [
    {
      email: 'le_trong_tan@tutoredu.com',
      fullName: 'Lê Trọng Tấn',
      phone: '0901234567',
      gradeLevel: 'Lớp 10',
      parentName: 'Lê Trọng Tấn',
    },
    {
      email: 'ngo_minh_an@tutoredu.com',
      fullName: 'Ngô Minh An',
      phone: '0935451882',
      gradeLevel: 'Lớp 12',
      parentName: 'Ngô Minh An',
    },
    {
      email: 'tran_my_duyen@tutoredu.com',
      fullName: 'Trần Mỹ Duyên',
      phone: '0918877520',
      gradeLevel: 'Lớp 11',
      parentName: 'Trần Mỹ Duyên',
    },
    {
      email: 'pham_huu_duc@tutoredu.com',
      fullName: 'Phạm Hữu Đức',
      phone: '0982612008',
      gradeLevel: 'Lớp 9',
      parentName: 'Phạm Hữu Đức',
    },
    {
      email: 'hoang_gia_bao@tutoredu.com',
      fullName: 'Hoàng Gia Bảo',
      phone: '0907225114',
      gradeLevel: 'Lớp 12',
      parentName: 'Hoàng Gia Bảo',
    },
  ];

  const seededStudentsMap = new Map<string, Student>();
  for (const item of mockStudentsData) {
    const existingUser = await userRepo.findOneBy({ email: item.email });
    let student: Student;
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Student123@', 10);
      const user = await userRepo.save(
        userRepo.create({
          email: item.email,
          passwordHash: hashedPassword,
          fullName: item.fullName,
          phone: item.phone,
          role: studentRole!,
          isActive: true,
        }),
      );

      student = await studentRepo.save(
        studentRepo.create({
          user,
          gradeLevel: item.gradeLevel,
          parentName: item.parentName,
          parentPhone: item.phone,
        }),
      );
      console.log(`Seeded student: ${item.fullName}`);
    } else {
      student = (await studentRepo.findOne({
        where: { user: { id: existingUser.id } },
      }))!;
    }
    seededStudentsMap.set(item.email, student);
  }

  // 7. Seed Class Requests
  const mathSubject = await subjectRepo.findOneBy({ name: 'Toán' });
  const chemSubject = await subjectRepo.findOneBy({ name: 'Hóa' });
  const engSubject = await subjectRepo.findOneBy({ name: 'Tiếng Anh' });

  const mockRequestsData = [
    {
      studentEmail: 'le_trong_tan@tutoredu.com',
      subject: mathSubject!,
      preferredArea: 'Quận 1, TP.HCM',
      preferredSchedule: 'Tối Thứ 2, Thứ 4 · 19:00 - 21:00',
      requirements:
        'Ưu tiên gia sư ĐH Bách Khoa hoặc KHTN, có kinh nghiệm dạy kèm cấp 3.',
      status: 'pending',
    },
    {
      studentEmail: 'ngo_minh_an@tutoredu.com',
      subject: engSubject!,
      preferredArea: 'Thủ Đức, TP.HCM',
      preferredSchedule: 'Sáng Thứ 7, Chủ nhật · 08:00 - 10:00',
      requirements:
        'Cần gia sư thiện về phát âm, giao tiếp, có giáo trình nền tảng phù hợp cho học viên mới.',
      status: 'processing',
    },
    {
      studentEmail: 'tran_my_duyen@tutoredu.com',
      subject: chemSubject!,
      preferredArea: 'Quận 7, TP.HCM',
      preferredSchedule: 'Chiều Thứ 3, Thứ 5 · 17:30 - 19:30',
      requirements:
        'Ưu tiên gia sư có kinh nghiệm dạy kèm cấp 3, bổ trợ nâng cao.',
      status: 'matched',
    },
  ];

  for (const item of mockRequestsData) {
    const student = seededStudentsMap.get(item.studentEmail);
    if (student) {
      const existingReq = await requestRepo.findOneBy({
        student: { id: student.id },
        subject: { id: item.subject.id },
      });
      if (!existingReq) {
        await requestRepo.save(
          requestRepo.create({
            student,
            subject: item.subject,
            preferredArea: item.preferredArea,
            preferredSchedule: item.preferredSchedule,
            requirements: item.requirements,
            status: item.status as any,
          }),
        );
        console.log(
          `Seeded class request for student of email: ${item.studentEmail}`,
        );
      }
    }
  }

  // 8. Seed Mock Classes (for dashboard stats)
  const activeTutorCam = await tutorRepo.findOne({
    where: { user: { email: 'tran_thi_cam@tutoredu.com' } },
  });
  const activeTutorBinh = await tutorRepo.findOne({
    where: { user: { email: 'nguyen_van_binh@tutoredu.com' } },
  });
  const studentDuyen = seededStudentsMap.get('tran_my_duyen@tutoredu.com');
  const studentTan = seededStudentsMap.get('le_trong_tan@tutoredu.com');

  if (activeTutorCam && studentDuyen) {
    const existingClass = await classRepo.findOneBy({
      tutor: { id: activeTutorCam.id },
      student: { id: studentDuyen.id },
    });
    if (!existingClass) {
      await classRepo.save(
        classRepo.create({
          tutor: activeTutorCam,
          student: studentDuyen,
          subject: chemSubject!,
          feePerSession: 300000,
          totalSessions: 20,
          status: 'active' as any,
          startDate: new Date('2026-05-01'),
          location: 'Quận 7, TP.HCM',
        }),
      );
      console.log('Seeded active class: Student Duyen & Tutor Cam');
    }
  }

  if (activeTutorBinh && studentTan) {
    const existingClass = await classRepo.findOneBy({
      tutor: { id: activeTutorBinh.id },
      student: { id: studentTan.id },
    });
    if (!existingClass) {
      await classRepo.save(
        classRepo.create({
          tutor: activeTutorBinh,
          student: studentTan,
          subject: mathSubject!,
          feePerSession: 250000,
          totalSessions: 10,
          status: 'completed' as any,
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-05-01'),
          location: 'Quận 1, TP.HCM',
        }),
      );
      console.log('Seeded completed class: Student Tan & Tutor Binh');
    }
  }

  console.log('Seeding completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
