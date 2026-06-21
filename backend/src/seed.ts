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
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F1',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'Khoa học máy tính',
        university: 'Đại học Bách Khoa TP.HCM',
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
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F2',
      tutor: {
        educationLevel: 'Giáo viên',
        major: 'Sư phạm Vật lí',
        university: 'Đại học Sư phạm TP.HCM',
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
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FSoutheast%20Asian%2F2',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'Công nghệ thông tin',
        university: 'Đại học Khoa học Tự nhiên TP.HCM',
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
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1',
      tutor: {
        educationLevel: 'Cử nhân',
        major: 'Sư phạm Toán',
        university: 'Đại học Sư phạm TP.HCM',
        experience: '3 năm kinh nghiệm dạy ôn thi',
        idCardNumber: '079123456786',
        availableAreas: 'Bình Thạnh',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
    // ========== Gia sư gợi ý (từ student dashboard) ==========
    {
      email: 'nguyen_minh_anh@tutoredu.com',
      fullName: 'Nguyễn Minh Anh',
      phone: '0901234567',
      address: 'Quận 1, TP.HCM',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F4',
      tutor: {
        educationLevel: 'Tốt nghiệp',
        major: 'Kỹ thuật điện',
        university: 'Đại học Bách Khoa TP.HCM',
        experience: '5 năm kinh nghiệm dạy kèm Toán THPT, luyện thi Đại học',
        idCardNumber: '079123456782',
        availableAreas: 'Quận 1, TP.HCM',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
    {
      email: 'tran_hoang_phuc@tutoredu.com',
      fullName: 'Trần Hoàng Phúc',
      phone: '0912345678',
      address: 'Quận 3, TP.HCM',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F3',
      tutor: {
        educationLevel: 'Thạc sĩ',
        major: 'Toán ứng dụng',
        university: 'Đại học Khoa học Tự nhiên TP.HCM',
        experience: '4 năm kinh nghiệm dạy kèm Toán lớp 10-12, luyện thi',
        idCardNumber: '079123456781',
        availableAreas: 'Quận 3, TP.HCM',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
    {
      email: 'le_khanh_vy@tutoredu.com',
      fullName: 'Lê Khánh Vy',
      phone: '0923456789',
      address: 'Bình Thạnh, TP.HCM',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FSoutheast%20Asian%2F5',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'Sư phạm Toán',
        university: 'Đại học Sư phạm TP.HCM',
        experience: '3 năm kinh nghiệm dạy kèm Toán cơ bản và Toán cấp 2',
        idCardNumber: '079123456780',
        availableAreas: 'Bình Thạnh',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
    {
      email: 'pham_quoc_huy@tutoredu.com',
      fullName: 'Phạm Quốc Huy',
      phone: '0934567890',
      address: 'Thủ Đức, TP.HCM',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FSoutheast%20Asian%2F1',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'Toán tin',
        university: 'Đại học Khoa học Tự nhiên TP.HCM',
        experience: '2 năm kinh nghiệm dạy kèm 1-1 Toán THPT',
        idCardNumber: '079123456779',
        availableAreas: 'Thủ Đức',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
    // ========== Gia sư tiêu biểu (từ trang chủ) ==========
    {
      email: 'nguyen_tran_bao_ngoc@tutoredu.com',
      fullName: 'Nguyễn Trần Bảo Ngọc',
      phone: '0905222333',
      address: 'Cầu Giấy, Hà Nội',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FSoutheast%20Asian%2F1',
      tutor: {
        educationLevel: 'Sinh viên',
        major: 'Sư phạm Toán',
        university: 'Đại học Sư phạm Hà Nội',
        experience:
          '2 năm kinh nghiệm dạy kèm Toán cấp 3, luyện thi Đại học. Chuyên ôn thi cho học sinh lớp 12.',
        idCardNumber: '079123456785',
        availableAreas: 'Cầu Giấy, Đống Đa, Ba Đình',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
    {
      email: 'le_hoang_nam@tutoredu.com',
      fullName: 'Lê Hoàng Nam',
      phone: '0906222333',
      address: 'Quận 1, TP.HCM',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F2',
      tutor: {
        educationLevel: 'Cử nhân',
        major: 'Ngôn ngữ Anh',
        university: 'Đại học Ngoại ngữ - ĐHQGHN',
        experience:
          'Cử nhân Ngôn Ngữ Anh, 4 năm kinh nghiệm giảng dạy tiếng Anh giao tiếp và luyện thi IELTS 7.5+.',
        idCardNumber: '079123456784',
        availableAreas: 'Quận 1, Quận 3, Quận 7',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Tiếng Anh'],
    },
    {
      email: 'tran_thi_mai@tutoredu.com',
      fullName: 'Trần Thị Mai',
      phone: '0907222333',
      address: 'Hải Châu, Đà Nẵng',
      avatarUrl:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F3',
      tutor: {
        educationLevel: 'Giáo viên',
        major: 'Giáo dục Tiểu học',
        university: 'Đại học Sư phạm Đà Nẵng',
        experience:
          '7 năm kinh nghiệm giảng dạy tiểu học. Chuyên rèn chữ đẹp và toán tiểu học cho các em nhỏ.',
        idCardNumber: '079123456783',
        availableAreas: 'Hải Châu, Thanh Khê, Sơn Trà',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học', 'Ngữ văn'],
    },
  ];
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNamesMale = ['Văn', 'Hữu', 'Minh', 'Đăng', 'Quốc', 'Hoàng', 'Thanh', 'Đức', 'Anh', 'Khánh'];
  const middleNamesFemale = ['Thị', 'Ngọc', 'Quỳnh', 'Thu', 'Như', 'Khánh', 'Minh', 'Thanh', 'Trúc', 'Hồng'];
  const firstNamesMale = ['Bình', 'Đạt', 'Phúc', 'Huy', 'Nam', 'Hùng', 'Kiệt', 'Anh', 'Tú', 'Lộc', 'Sơn', 'Tùng', 'Khoa', 'Lâm', 'Duy', 'Thịnh', 'Khải', 'Hải', 'Phong', 'Quang'];
  const firstNamesFemale = ['Cẩm', 'Hà', 'Vy', 'Ngọc', 'Trang', 'Mai', 'Lan', 'Liên', 'Trúc', 'Phương', 'Linh', 'Thảo', 'Yến', 'Anh', 'Chi', 'Diệp', 'Trinh', 'Giang', 'Hương', 'Duyên'];

  const extraTutors: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const isMale = i % 2 === 0;
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const middleName = isMale 
      ? middleNamesMale[Math.floor(Math.random() * middleNamesMale.length)]
      : middleNamesFemale[Math.floor(Math.random() * middleNamesFemale.length)];
    const firstName = isMale
      ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
      : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
    const fullName = `${lastName} ${middleName} ${firstName}`;
    
    const emailSlug = fullName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "_");
    
    const email = `${emailSlug}_${i}@tutoredu.com`;
    const phone = `098${String(i).padStart(3, '0')}${Math.floor(1000 + Math.random() * 9000)}`;
    const address = `Quận ${Math.floor(1 + Math.random() * 12)}, TP.HCM`;
    
    const genderStr = isMale ? 'male' : 'female';
    const avatarNum = (i % 10) + 1;
    const avatarUrl = `https://storage.googleapis.com/banani-avatars/avatar%2F${genderStr}%2F18-25%2FSoutheast%20Asian%2F${avatarNum}`;
    
    const subjectsList = [['Toán học'], ['Vật lí'], ['Hóa học'], ['Tiếng Anh'], ['Ngữ văn'], ['Tin học']];
    const tutorSubjects = subjectsList[i % subjectsList.length];
    
    const majors = ['Sư phạm Toán', 'Sư phạm Vật lí', 'Sư phạm Hóa', 'Ngôn ngữ Anh', 'Công nghệ thông tin', 'Toán tin'];
    const major = majors[i % majors.length];
    
    const universities = ['Đại học Sư phạm TP.HCM', 'Đại học Bách Khoa TP.HCM', 'Đại học Khoa học Tự nhiên TP.HCM', 'Đại học Sài Gòn'];
    const university = universities[i % universities.length];
    
    const educationLevels = ['Sinh viên', 'Cử nhân', 'Giáo viên', 'Thạc sĩ'];
    const educationLevel = educationLevels[i % educationLevels.length];

    extraTutors.push({
      email,
      fullName,
      phone,
      address,
      avatarUrl,
      tutor: {
        educationLevel,
        major,
        university,
        experience: `${Math.floor(1 + Math.random() * 5)} năm kinh nghiệm dạy kèm môn ${tutorSubjects.join(', ')}`,
        idCardNumber: `079${Math.floor(100000000 + Math.random() * 900000000)}`,
        availableAreas: address.split(',')[0],
        approvalStatus: i % 10 === 0 ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
      },
      subjects: tutorSubjects
    });
  }
  mockTutorsData.push(...extraTutors);

  for (const item of mockTutorsData) {
    const existing = await userRepo.findOneBy({ email: item.email });
    if (existing) {
      const tutor = await tutorRepo.findOne({
        where: { user: { id: existing.id } },
      });
      if (tutor) {
        tutor.major = item.tutor.major;
        tutor.university = item.tutor.university;
        tutor.educationLevel = item.tutor.educationLevel;
        await tutorRepo.save(tutor);
      }
      // Cập nhật avatar và các thông tin khác cho user của tutor đã tồn tại
      if (existing.avatarUrl !== item.avatarUrl) {
        existing.avatarUrl = item.avatarUrl;
        existing.fullName = item.fullName;
        existing.phone = item.phone;
        existing.address = item.address;
        await userRepo.save(existing);
        console.log(`Updated avatar & info for existing tutor: ${item.fullName}`);
      }
    } else {
      const hashedPassword = await bcrypt.hash('Tutor123@', 10);
      const user = await userRepo.save(
        userRepo.create({
          email: item.email,
          passwordHash: hashedPassword,
          fullName: item.fullName,
          phone: item.phone,
          address: item.address,
          avatarUrl: item.avatarUrl,
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
    {
      email: 'nguyen_thi_ha@tutoredu.com',
      fullName: 'Nguyễn Thị Hà',
      phone: '0908888999',
      gradeLevel: 'Lớp 11',
      parentName: 'Nguyễn Thị Hà',
    },
  ];

  const extraStudents: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const isMale = i % 2 === 0;
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const middleName = isMale 
      ? middleNamesMale[Math.floor(Math.random() * middleNamesMale.length)]
      : middleNamesFemale[Math.floor(Math.random() * middleNamesFemale.length)];
    const firstName = isMale
      ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
      : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
    const fullName = `${lastName} ${middleName} ${firstName}`;
    
    const emailSlug = fullName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "_");
      
    const email = `${emailSlug}_student_${i}@tutoredu.com`;
    const phone = `090${String(i).padStart(3, '0')}${Math.floor(1000 + Math.random() * 9000)}`;
    const gradeLevel = `Lớp ${Math.floor(1 + Math.random() * 12)}`;
    
    const parentLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const parentName = `${parentLastName} Văn ${isMale ? 'Hùng' : 'Dũng'}`;
    
    extraStudents.push({
      email,
      fullName,
      phone,
      gradeLevel,
      parentName,
    });
  }
  mockStudentsData.push(...extraStudents);

  const seededStudentsMap = new Map<string, Student>();
  for (let i = 0; i < mockStudentsData.length; i++) {
    const item = mockStudentsData[i];
    const isMale = i % 2 === 0;
    const genderStr = isMale ? 'male' : 'female';
    const avatarNum = (i % 10) + 1;
    const avatarUrl = `https://storage.googleapis.com/banani-avatars/avatar%2F${genderStr}%2F18-25%2FSoutheast%20Asian%2F${avatarNum}`;

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
          avatarUrl: avatarUrl,
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
      if (!existingUser.avatarUrl) {
        existingUser.avatarUrl = avatarUrl;
        await userRepo.save(existingUser);
        console.log(`Updated avatar for existing student: ${item.fullName}`);
      }
      student = (await studentRepo.findOne({
        where: { user: { id: existingUser.id } },
      }))!;
    }
    seededStudentsMap.set(item.email, student);
  }

  // 7. Seed Class Requests
  const mathSubject = await subjectRepo.findOneBy({ name: 'Toán học' });
  const chemSubject = await subjectRepo.findOneBy({ name: 'Hóa học' });
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

  const scheduleRepo = dataSource.getRepository(Schedule);

  // Tính toán các ngày trong tuần hiện tại để hiển thị trên Calendar
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Lấy Thứ 2 tuần này
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  const monDate = new Date(monday);
  const tueDate = new Date(monday); tueDate.setDate(monday.getDate() + 1);
  const wedDate = new Date(monday); wedDate.setDate(monday.getDate() + 2);
  const thuDate = new Date(monday); thuDate.setDate(monday.getDate() + 3);
  const friDate = new Date(monday); friDate.setDate(monday.getDate() + 4);

  if (activeTutorCam && studentDuyen) {
    let existingClass = await classRepo.findOneBy({
      tutor: { id: activeTutorCam.id },
      student: { id: studentDuyen.id },
    });
    if (!existingClass) {
      existingClass = await classRepo.save(
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

    // Seed lịch học (Schedule) cho lớp này
    const monSchedule = await scheduleRepo.findOneBy({
      class: { id: existingClass.id },
      sessionDate: monDate,
    });
    if (!monSchedule) {
      await scheduleRepo.save(
        scheduleRepo.create({
          class: existingClass,
          sessionDate: monDate,
          dayOfWeek: 'Thứ 2',
          startTime: '19:00:00',
          endTime: '21:00:00',
          sessionStatus: 'scheduled' as any,
          note: 'Học lý thuyết hóa hữu cơ',
        }),
      );
    }

    const wedSchedule = await scheduleRepo.findOneBy({
      class: { id: existingClass.id },
      sessionDate: wedDate,
    });
    if (!wedSchedule) {
      await scheduleRepo.save(
        scheduleRepo.create({
          class: existingClass,
          sessionDate: wedDate,
          dayOfWeek: 'Thứ 4',
          startTime: '19:00:00',
          endTime: '21:00:00',
          sessionStatus: 'scheduled' as any,
          note: 'Giải bài tập phản ứng este hóa',
        }),
      );
    }

    const friSchedule = await scheduleRepo.findOneBy({
      class: { id: existingClass.id },
      sessionDate: friDate,
    });
    if (!friSchedule) {
      await scheduleRepo.save(
        scheduleRepo.create({
          class: existingClass,
          sessionDate: friDate,
          dayOfWeek: 'Thứ 6',
          startTime: '19:00:00',
          endTime: '21:00:00',
          sessionStatus: 'scheduled' as any,
          note: 'Kiểm tra định kỳ 15 phút',
        }),
      );
    }
  }

  const studentHa = seededStudentsMap.get('nguyen_thi_ha@tutoredu.com');
  if (activeTutorCam && studentHa) {
    let existingClass = await classRepo.findOneBy({
      tutor: { id: activeTutorCam.id },
      student: { id: studentHa.id },
    });
    if (!existingClass) {
      existingClass = await classRepo.save(
        classRepo.create({
          tutor: activeTutorCam,
          student: studentHa,
          subject: mathSubject!,
          feePerSession: 250000,
          totalSessions: 15,
          status: 'active' as any,
          startDate: new Date('2026-06-01'),
          location: 'Quận 7, TP.HCM',
        }),
      );
      console.log('Seeded active class: Student Ha & Tutor Cam');
    }

    // Seed lịch học (Schedule) cho lớp mới này - Đã xóa theo yêu cầu
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

  // ======================================================================
  // 9. Seed MORE classes for prominent tutors (để có dữ liệu price thực tế)
  // ======================================================================
  const reviewRepo = dataSource.getRepository(Review);
  const litSubject = await subjectRepo.findOneBy({ name: 'Ngữ văn' });

  // Danh sách các cặp tutor-student-subject để tạo thêm classes
  const additionalClassMappings = [
    { tutorEmail: 'phan_ngoc_ha@tutoredu.com', studentEmail: 'tran_my_duyen@tutoredu.com',  subject: mathSubject!,  fee: 200000, status: 'active', location: 'Bình Thạnh, TP.HCM' },
    { tutorEmail: 'nguyen_minh_anh@tutoredu.com', studentEmail: 'le_trong_tan@tutoredu.com',  subject: mathSubject!,  fee: 250000, status: 'active', location: 'Quận 1, TP.HCM' },
    { tutorEmail: 'tran_hoang_phuc@tutoredu.com', studentEmail: 'hoang_gia_bao@tutoredu.com', subject: mathSubject!,  fee: 300000, status: 'active', location: 'Quận 3, TP.HCM' },
    { tutorEmail: 'le_khanh_vy@tutoredu.com',    studentEmail: 'ngo_minh_an@tutoredu.com',  subject: mathSubject!,  fee: 180000, status: 'active', location: 'Bình Thạnh, TP.HCM' },
    { tutorEmail: 'pham_quoc_huy@tutoredu.com',  studentEmail: 'pham_huu_duc@tutoredu.com', subject: mathSubject!,  fee: 220000, status: 'active', location: 'Thủ Đức, TP.HCM' },
    { tutorEmail: 'nguyen_tran_bao_ngoc@tutoredu.com', studentEmail: 'nguyen_thi_ha@tutoredu.com', subject: mathSubject!, fee: 250000, status: 'active', location: 'Cầu Giấy, Hà Nội' },
    { tutorEmail: 'le_hoang_nam@tutoredu.com',    studentEmail: 'ngo_minh_an@tutoredu.com',  subject: engSubject!,   fee: 350000, status: 'active', location: 'Quận 1, TP.HCM' },
    { tutorEmail: 'tran_thi_mai@tutoredu.com',   studentEmail: 'pham_huu_duc@tutoredu.com',  subject: litSubject!,   fee: 200000, status: 'active', location: 'Hải Châu, Đà Nẵng' },
  ];

  for (const mapping of additionalClassMappings) {
    const tutor = await tutorRepo.findOne({
      where: { user: { email: mapping.tutorEmail } },
    });
    const student = seededStudentsMap.get(mapping.studentEmail);
    if (!tutor || !student) {
      console.log(`  Skipping class: tutor ${mapping.tutorEmail} or student ${mapping.studentEmail} not found`);
      continue;
    }

    const existingClass = await classRepo.findOneBy({
      tutor: { id: tutor.id },
      student: { id: student.id },
    });
    if (!existingClass) {
      await classRepo.save(
        classRepo.create({
          tutor,
          student,
          subject: mapping.subject,
          feePerSession: mapping.fee,
          totalSessions: 15,
          status: mapping.status as any,
          startDate: new Date('2026-05-01'),
          location: mapping.location,
        }),
      );
      console.log(`Seeded class: ${mapping.tutorEmail.split('@')[0]} + ${mapping.studentEmail.split('@')[0]} (${mapping.subject.name}, ${mapping.fee.toLocaleString('vi-VN')}đ/buổi)`);
    }
  }

  // ======================================================================
  // 10. Seed REVIEWS — tất cả các lớp đã có (cả cũ và mới)
  // ======================================================================
  const allReviewableClasses = await classRepo.find({
    relations: ['tutor', 'student', 'subject'],
  });

  const reviewTemplates: { statusSubstring: string; minRating: number; maxRating: number; comments: string[] }[] = [
    {
      statusSubstring: 'completed',
      minRating: 4,
      maxRating: 5,
      comments: [
        'Gia sư dạy rất tận tình, dễ hiểu. Con tôi tiến bộ rõ rệt chỉ sau 1 tháng.',
        'Phương pháp giảng dạy khoa học, phù hợp với học sinh. Rất hài lòng!',
        'Cháu rất thích học với gia sư này. Kiến thức được truyền đạt một cách dễ hiểu và thú vị.',
        'Gia sư chuyên nghiệp, đúng giờ, có giáo trình rõ ràng. Rất đáng tin cậy.',
      ],
    },
    {
      statusSubstring: 'active',
      minRating: 3,
      maxRating: 5,
      comments: [
        'Gia sư nhiệt tình, tuy nhiên cần cải thiện thêm về phương pháp giảng dạy cho phù hợp với học sinh yếu.',
        'Dạy khá tốt, con tôi bắt đầu hiểu bài hơn. Hy vọng sẽ tiến bộ nhiều trong thời gian tới.',
        'Gia sư có kiến thức vững vàng, thân thiện với học sinh. Rất hài lòng!',
        'Rất may mắn tìm được gia sư phù hợp. Bé nhà tôi đã có hứng thú học tập trở lại.',
        'Gia sư dạy có tâm, chuẩn bị bài kỹ càng trước mỗi buổi học. Điểm số của con đã cải thiện.',
        'Học phí hợp lý, chất lượng giảng dạy tốt. Sẽ tiếp tục theo học dài hạn.',
      ],
    },
  ];

  let reviewCount = 0;
  for (const cls of allReviewableClasses) {
    // Kiểm tra đã có review cho class này chưa
    const existingReview = await reviewRepo.findOneBy({
      class: { id: cls.id },
      student: { id: cls.student.id },
    });
    if (existingReview) continue;

    // Chọn template dựa trên status
    const template = reviewTemplates.find(t => cls.status.includes(t.statusSubstring as string)) || reviewTemplates[1];
    const rating = Math.floor(Math.random() * (template.maxRating - template.minRating + 1)) + template.minRating;
    const comment = template.comments[Math.floor(Math.random() * template.comments.length)];

    await reviewRepo.save(
      reviewRepo.create({
        class: cls,
        student: cls.student,
        tutor: cls.tutor,
        rating,
        comment,
      }),
    );
    reviewCount++;
  }

  if (reviewCount > 0) {
    console.log(`Seeded ${reviewCount} reviews for tutor classes.`);
  }

  console.log('Seeding completed successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
