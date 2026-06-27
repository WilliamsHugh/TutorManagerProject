import { DataSource, Between } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Student } from './users/entities/student.entity';
import { Tutor, ApprovalStatus } from './users/entities/tutor.entity';
import { Subject } from './subjects/subject.entity';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

import { TutorSubject } from './tutors/tutor-subject.entity';
import {
  ClassRequest,
  RequestStatus,
} from './classes/entities/class-request.entity';
import { Class, ClassStatus } from './classes/entities/class.entity';
import { Schedule, SessionStatus } from './classes/entities/schedule.entity';
import {
  LearningReport,
  ProgressRating,
} from './classes/entities/learning-report.entity';
import { Review } from './classes/entities/review.entity';
import {
  Notification,
  NotificationType,
} from './notifications/notification.entity';

// For seeding, use session mode (port 5432) instead of transaction mode (port 6543)
// Transaction mode doesn't support prepared statements and causes FK issues with eager loading
const seedDbUrl = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(':6543/', ':5432/')
  : undefined;

const dataSource = new DataSource({
  type: 'postgres',
  url: seedDbUrl,
  host: !seedDbUrl ? process.env.DB_HOST : undefined,
  port: !seedDbUrl ? Number(process.env.DB_PORT) : undefined,
  username: !seedDbUrl ? process.env.DB_USERNAME : undefined,
  password: !seedDbUrl ? process.env.DB_PASSWORD : undefined,
  database: !seedDbUrl ? process.env.DB_NAME : undefined,
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
  ssl: seedDbUrl ? { rejectUnauthorized: false } : false,
});

// ============ HELPER: Loại bỏ dấu tiếng Việt ============
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// ============ HELPER: Random item từ mảng ============
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============ HELPER: Sequential ID counter để tránh trùng idCardNumber ============
// Bắt đầu từ 200M để tránh trùng với ID cứng (079100000001–079100000011)
let idCounter = 200000000;

function nextIdCard(): string {
  return `079${String(idCounter++).padStart(9, '0')}`;
}

// ============ SEED DATA ============
const LAST_NAMES = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
  'Đinh',
];
const MIDDLE_MALE = [
  'Văn',
  'Hữu',
  'Minh',
  'Đăng',
  'Quốc',
  'Hoàng',
  'Thanh',
  'Đức',
  'Anh',
  'Khánh',
];
const MIDDLE_FEMALE = [
  'Thị',
  'Ngọc',
  'Quỳnh',
  'Thu',
  'Như',
  'Khánh',
  'Minh',
  'Thanh',
  'Trúc',
  'Hồng',
];
const FIRST_MALE = [
  'Bình',
  'Đạt',
  'Phúc',
  'Huy',
  'Nam',
  'Hùng',
  'Kiệt',
  'Anh',
  'Tú',
  'Lộc',
  'Sơn',
  'Tùng',
  'Khoa',
  'Lâm',
  'Duy',
  'Thịnh',
  'Khải',
  'Hải',
  'Phong',
  'Quang',
  'Cường',
  'Dũng',
  'Hiếu',
  'Long',
  'Mạnh',
];
const FIRST_FEMALE = [
  'Cẩm',
  'Hà',
  'Vy',
  'Ngọc',
  'Trang',
  'Mai',
  'Lan',
  'Liên',
  'Trúc',
  'Phương',
  'Linh',
  'Thảo',
  'Yến',
  'Anh',
  'Chi',
  'Diệp',
  'Trinh',
  'Giang',
  'Hương',
  'Duyên',
  'Nhung',
  'Oanh',
  'Tuyết',
  'Xuân',
  'Đào',
];

const AREAS = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Bình Thạnh',
  'Thủ Đức',
  'Gò Vấp',
  'Tân Bình',
  'Tân Phú',
  'Phú Nhuận',
  'Cầu Giấy, Hà Nội',
  'Hải Châu, Đà Nẵng',
];

const EDU_LEVELS = ['Sinh viên', 'Cử nhân', 'Giáo viên', 'Thạc sĩ'];
const MAJORS = [
  'Sư phạm Toán',
  'Sư phạm Vật lí',
  'Sư phạm Hóa',
  'Ngôn ngữ Anh',
  'Công nghệ thông tin',
  'Toán tin',
  'Khoa học máy tính',
  'Sư phạm Ngữ văn',
];
const UNIVERSITIES = [
  'Đại học Sư phạm TP.HCM',
  'Đại học Bách Khoa TP.HCM',
  'Đại học Khoa học Tự nhiên TP.HCM',
  'Đại học Sài Gòn',
  'Đại học Sư phạm Hà Nội',
  'Đại học Ngoại ngữ - ĐHQGHN',
  'Đại học Sư phạm Đà Nẵng',
];

const GRADE_LEVELS = [
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
];

const REVIEW_COMMENTS = [
  {
    min: 1,
    max: 2,
    comments: [
      'Gia sư cần cải thiện phương pháp giảng dạy.',
      'Chưa đáp ứng được yêu cầu học tập.',
      'Cần chuẩn bị bài kỹ hơn trước mỗi buổi học.',
    ],
  },
  {
    min: 3,
    max: 3,
    comments: [
      'Tạm ổn, gia sư nhiệt tình nhưng cần chuyên nghiệp hơn.',
      'Có tiến bộ nhưng chưa như kỳ vọng.',
      'Gia sư đúng giờ, kiến thức còn hạn chế ở một số phần.',
    ],
  },
  {
    min: 4,
    max: 5,
    comments: [
      'Gia sư dạy rất tận tình, dễ hiểu. Con tôi tiến bộ rõ rệt chỉ sau 1 tháng.',
      'Phương pháp giảng dạy khoa học, phù hợp với học sinh. Rất hài lòng!',
      'Cháu rất thích học với gia sư này. Kiến thức được truyền đạt một cách dễ hiểu và thú vị.',
      'Gia sư chuyên nghiệp, đúng giờ, có giáo trình rõ ràng. Rất đáng tin cậy.',
      'Gia sư có kiến thức vững vàng, thân thiện với học sinh.',
      'Rất may mắn tìm được gia sư phù hợp. Bé nhà tôi đã có hứng thú học tập trở lại.',
      'Gia sư dạy có tâm, chuẩn bị bài kỹ càng trước mỗi buổi học. Điểm số của con đã cải thiện.',
      'Học phí hợp lý, chất lượng giảng dạy tốt. Sẽ tiếp tục theo học dài hạn.',
    ],
  },
];

function getRandomReviewComment(): { rating: number; comment: string } {
  const templates =
    REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
  const rating =
    Math.floor(Math.random() * (templates.max - templates.min + 1)) +
    templates.min;
  const comment = pickRandom(templates.comments);
  return { rating, comment };
}

const REPORT_CONTENTS = [
  'Hôm nay học về kiến thức mới, học sinh tiếp thu khá nhanh. Cần ôn tập thêm ở nhà.',
  'Buổi học tập trung vào giải bài tập khó. Học sinh đã hiểu được phương pháp giải.',
  'Ôn tập kiến thức cũ và làm bài kiểm tra nhỏ. Kết quả đạt yêu cầu.',
  'Học về chương mới, học sinh còn bỡ ngỡ nhưng đã cố gắng theo kịp.',
  'Buổi học hôm nay hiệu quả, học sinh hoàn thành tốt các bài tập được giao.',
  'Rèn luyện kỹ năng làm bài thi, học sinh đã cải thiện về tốc độ làm bài.',
  'Học bù do lịch nghỉ tuần trước. Học sinh tập trung tốt.',
  'Kiểm tra 15 phút đầu giờ, sau đó chữa bài và học kiến thức mới.',
];

const HOMEWORK_LIST = [
  'Làm bài tập trang 45-48 SGK',
  'Hoàn thành đề ôn tập số 2',
  'Viết đoạn văn 200 từ về chủ đề đã học',
  'Giải các bài tập nâng cao đã ghi trong buổi học',
  'Ôn tập lại công thức và làm bài kiểm tra mẫu',
  'Đọc trước bài mới và ghi chú những phần chưa hiểu',
  'Hoàn thành phiếu bài tập đã phát',
  'Làm bài tập trên ứng dụng học tập',
];

const NOTIFICATION_TITLES = [
  'Lịch học được xác nhận',
  'Yêu cầu gia sư mới',
  'Lớp học đã được tạo',
  'Nhắc nhở lịch học',
  'Thông báo từ quản trị viên',
  'Cập nhật tiến độ học tập',
  'Đánh giá buổi học',
  'Gia sư đã được phê duyệt',
];

const NOTIFICATION_MESSAGES = [
  'Lịch học của bạn đã được xác nhận. Vui lòng kiểm tra lịch để biết thêm chi tiết.',
  'Có yêu cầu tìm gia sư mới từ học viên. Vui lòng xem xét và phản hồi.',
  'Lớp học mới đã được tạo thành công. Thông tin chi tiết đã được gửi qua email.',
  'Đây là nhắc nhở về buổi học sắp tới. Hãy chuẩn bị bài trước khi đến lớp.',
  'Có thông báo mới từ quản trị viên. Vui lòng kiểm tra trang thông báo.',
  'Tiến độ học tập của học viên đã được cập nhật. Xem báo cáo để biết thêm chi tiết.',
  'Đánh giá buổi học đã được ghi nhận. Cảm ơn bạn đã đóng góp ý kiến.',
  'Hồ sơ gia sư của bạn đã được phê duyệt. Bạn có thể bắt đầu nhận lớp ngay.',
];

const SCHEDULE_NOTES = [
  'Học lý thuyết chương mới',
  'Giải bài tập ứng dụng',
  'Ôn tập kiến thức cũ',
  'Kiểm tra định kỳ 15 phút',
  'Thực hành bài tập nâng cao',
  'Chữa bài tập về nhà',
  'Học bù buổi trước',
  'Luyện đề thi thử',
];

// =====================================================================
// RESET DATABASE - Xoá toàn bộ dữ liệu cũ trước khi seed
// =====================================================================
async function resetDatabase() {
  const queryRunner = dataSource.createQueryRunner();
  try {
    console.log('\n--- 0. Resetting Database ---');
    // Disable foreign key triggers
    await queryRunner.query(`SET session_replication_role = 'replica'`);

    // Truncate all tables in dependency order (child → parent)
    const tables = [
      'notifications',
      'reviews',
      'learning_reports',
      'schedules',
      'classes',
      'tutor_subjects',
      'class_requests',
      'students',
      'tutors',
      'refresh_tokens',
      'otps',
      'users',
      'roles',
      'subjects',
      'settings',
    ];

    for (const table of tables) {
      await queryRunner.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }

    // Re-enable foreign key triggers
    await queryRunner.query(`SET session_replication_role = 'origin'`);

    console.log('   + All tables truncated successfully');
  } finally {
    await queryRunner.release();
  }
}

// =====================================================================
// MAIN SEED FUNCTION
// =====================================================================
async function seed() {
  await dataSource.initialize();
  console.log('✅ Database connected for seeding...');
  await resetDatabase();
  const startTime = Date.now();

  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const subjectRepo = dataSource.getRepository(Subject);
  const tutorRepo = dataSource.getRepository(Tutor);
  const tutorSubjectRepo = dataSource.getRepository(TutorSubject);
  const studentRepo = dataSource.getRepository(Student);
  const requestRepo = dataSource.getRepository(ClassRequest);
  const classRepo = dataSource.getRepository(Class);
  const scheduleRepo = dataSource.getRepository(Schedule);
  const reviewRepo = dataSource.getRepository(Review);
  const reportRepo = dataSource.getRepository(LearningReport);
  const notificationRepo = dataSource.getRepository(Notification);

  // ===================================================================
  // 1. ROLES
  // ===================================================================
  console.log('\n--- 1. Seeding Roles ---');
  const roleNames = ['admin', 'staff', 'tutor', 'student'];
  const roleMap = new Map<string, Role>();

  for (const name of roleNames) {
    let role = await roleRepo.findOneBy({ name });
    if (!role) {
      role = await roleRepo.save(
        roleRepo.create({ name, description: `Vai trò ${name}` }),
      );
      console.log(`   + Created role: ${name}`);
    }
    roleMap.set(name, role);
  }

  const adminRole = roleMap.get('admin')!;
  const staffRole = roleMap.get('staff')!;
  const tutorRole = roleMap.get('tutor')!;
  const studentRole = roleMap.get('student')!;

  // ===================================================================
  // 2. SUBJECTS (9 subjects matching Supabase)
  // ===================================================================
  console.log('\n--- 2. Seeding Subjects ---');
  const subjectNames = [
    'Toán học',
    'Vật lí',
    'Hóa học',
    'Tiếng Anh',
    'Ngữ văn',
    'Tin học',
    'Sinh học',
    'Lịch sử',
    'Địa lí',
    'Luyện thi ĐH',
  ];
  const subjectMap = new Map<string, Subject>();

  for (const name of subjectNames) {
    let subject = await subjectRepo.findOneBy({ name });
    if (!subject) {
      subject = await subjectRepo.save(
        subjectRepo.create({ name, isActive: true }),
      );
      console.log(`   + Created subject: ${name}`);
    }
    subjectMap.set(name, subject);
  }

  // ===================================================================
  // 3. ADMIN & STAFF
  // ===================================================================
  console.log('\n--- 3. Seeding Admin & Staff ---');

  const adminData = {
    email: 'admin@tutoredu.com',
    fullName: 'Hệ thống Admin',
    password: 'Admin123@',
  };
  const staffData = {
    email: 'staff@tutoredu.com',
    fullName: 'Nhân viên quản lý',
    password: 'Staff123@',
  };

  for (const data of [adminData, staffData]) {
    const existing = await userRepo.findOneBy({ email: data.email });
    if (!existing) {
      const hashed = await bcrypt.hash(data.password, 4);
      await userRepo.save(
        userRepo.create({
          email: data.email,
          passwordHash: hashed,
          fullName: data.fullName,
          role: data.email.includes('admin') ? adminRole : staffRole,
          isActive: true,
        }),
      );
      console.log(`   + Created: ${data.email} / ${data.password}`);
    } else {
      console.log(`   ~ Skipped (exists): ${data.email}`);
    }
  }

  // ===================================================================
  // 4. HARDCODED TUTORS (13 tutors referenced in frontend)
  // ===================================================================
  console.log('\n--- 4. Seeding Hardcoded Tutors ---');
  const hardcodedTutors = [
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
        idCardNumber: '079100000001',
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
        idCardNumber: '079100000002',
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
        idCardNumber: '079100000003',
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
        idCardNumber: '079100000004',
        availableAreas: 'Bình Thạnh',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
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
        idCardNumber: '079100000005',
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
        idCardNumber: '079100000006',
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
        idCardNumber: '079100000007',
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
        idCardNumber: '079100000008',
        availableAreas: 'Thủ Đức',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học'],
    },
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
        experience: '2 năm kinh nghiệm dạy kèm Toán cấp 3, luyện thi Đại học.',
        idCardNumber: '079100000009',
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
        idCardNumber: '079100000010',
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
        experience: '7 năm kinh nghiệm giảng dạy tiểu học.',
        idCardNumber: '079100000011',
        availableAreas: 'Hải Châu, Thanh Khê, Sơn Trà',
        approvalStatus: ApprovalStatus.APPROVED,
      },
      subjects: ['Toán học', 'Ngữ văn'],
    },
  ];

  // Seed với upsert: tìm email, nếu có thì update, nếu không thì tạo mới
  const seededTutorsMap = new Map<string, Tutor>();
  const allTutorData = [...hardcodedTutors];

  // ===================================================================
  // 5. GENERATED TUTORS (~237 more for ~250 total)
  // ===================================================================
  console.log('\n--- 5. Generating Extra Tutors ---');
  const extraTutorCount = 237;
  for (let i = 1; i <= extraTutorCount; i++) {
    const isMale = i % 2 === 0;
    const lastName = pickRandom(LAST_NAMES);
    const middleName = isMale
      ? pickRandom(MIDDLE_MALE)
      : pickRandom(MIDDLE_FEMALE);
    const firstName = isMale
      ? pickRandom(FIRST_MALE)
      : pickRandom(FIRST_FEMALE);
    const fullName = `${lastName} ${middleName} ${firstName}`;
    const emailSlug = removeVietnameseTones(fullName.toLowerCase()).replace(
      /\s+/g,
      '_',
    );
    const email = `${emailSlug}_${i}@tutoredu.com`;
    const phone = `098${String(Math.floor(Math.random() * 900) + 100)}${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const area = pickRandom(AREAS);
    const genderStr = isMale ? 'male' : 'female';
    const avatarNum = (i % 10) + 1;
    const avatarUrl = `https://storage.googleapis.com/banani-avatars/avatar%2F${genderStr}%2F18-25%2FSoutheast%20Asian%2F${avatarNum}`;

    // Choose 1-2 subjects
    const allSubjectNames = Array.from(subjectMap.values()).map((s) => s.name);
    const numSubjects = Math.random() < 0.4 ? 2 : 1;
    const shuffled = [...allSubjectNames].sort(() => Math.random() - 0.5);
    const tutorSubjects = shuffled.slice(0, numSubjects);

    allTutorData.push({
      email,
      fullName,
      phone,
      address: `${area}, TP.HCM`,
      avatarUrl,
      tutor: {
        educationLevel: pickRandom(EDU_LEVELS),
        major: pickRandom(MAJORS),
        university: pickRandom(UNIVERSITIES),
        experience: `${Math.floor(1 + Math.random() * 7)} năm kinh nghiệm dạy kèm môn ${tutorSubjects.join(', ')}`,
        idCardNumber: nextIdCard(),
        availableAreas: area,
        approvalStatus:
          i % 8 === 0 ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
      },
      subjects: tutorSubjects,
    });
  }

  // Seed all tutors
  let tutorCount = 0;
  for (const item of allTutorData) {
    const existingUser = await userRepo.findOneBy({ email: item.email });
    if (existingUser) {
      // Update existing tutor info
      existingUser.avatarUrl = item.avatarUrl;
      existingUser.fullName = item.fullName;
      existingUser.phone = item.phone;
      existingUser.address = item.address;
      await userRepo.save(existingUser);

      let existingTutor = await tutorRepo.findOne({
        where: { user: { id: existingUser.id } },
      });
      if (existingTutor) {
        existingTutor.major = item.tutor.major;
        existingTutor.university = item.tutor.university;
        existingTutor.educationLevel = item.tutor.educationLevel;
        existingTutor.experience = item.tutor.experience;
        existingTutor.availableAreas = item.tutor.availableAreas;
        existingTutor.approvalStatus = item.tutor.approvalStatus;
        await tutorRepo.save(existingTutor);
        seededTutorsMap.set(item.email, existingTutor);
      } else {
        // User exists but tutor record was deleted — create new
        existingTutor = await tutorRepo.save(
          tutorRepo.create({
            ...item.tutor,
            user: existingUser,
          }),
        );
        seededTutorsMap.set(item.email, existingTutor);
      }
      continue;
    }

    const hashedPassword = await bcrypt.hash('Tutor123@', 4);
    const user = await userRepo.save(
      userRepo.create({
        email: item.email,
        passwordHash: hashedPassword,
        fullName: item.fullName,
        phone: item.phone,
        address: item.address,
        avatarUrl: item.avatarUrl,
        role: tutorRole,
        isActive: true,
      }),
    );

    const tutor = await tutorRepo.save(
      tutorRepo.create({
        ...item.tutor,
        user,
      }),
    );

    seededTutorsMap.set(item.email, tutor);
    tutorCount++;

    // Tutor-Subject connections — use raw SQL to avoid eager-loading issues with connection pooler
    for (const subName of item.subjects) {
      const subject = subjectMap.get(subName);
      if (subject) {
        await dataSource.query(
          `INSERT INTO "tutor_subjects" ("id", "proficiency_level", "years_experience", "tutor_id", "subject_id")
           VALUES (gen_random_uuid(), $1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [
            Math.random() < 0.3 ? 'Nâng cao' : 'Cơ bản',
            Math.floor(1 + Math.random() * 5),
            tutor.id,
            subject.id,
          ],
        );
      }
    }
  }
  console.log(`   + Total tutors seeded/updated: ${seededTutorsMap.size}`);

  // ===================================================================
  // 6. HARDCODED STUDENTS (6) + GENERATED (~244 for ~250 total)
  // ===================================================================
  console.log('\n--- 6. Seeding Students ---');
  const hardcodedStudents = [
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

  const allStudentData = [...hardcodedStudents];
  const extraStudentCount = 244;

  for (let i = 1; i <= extraStudentCount; i++) {
    const isMale = i % 2 === 0;
    const lastName = pickRandom(LAST_NAMES);
    const middleName = isMale
      ? pickRandom(MIDDLE_MALE)
      : pickRandom(MIDDLE_FEMALE);
    const firstName = isMale
      ? pickRandom(FIRST_MALE)
      : pickRandom(FIRST_FEMALE);
    const fullName = `${lastName} ${middleName} ${firstName}`;
    const emailSlug = removeVietnameseTones(fullName.toLowerCase()).replace(
      /\s+/g,
      '_',
    );
    const email = `${emailSlug}_student_${i}@tutoredu.com`;
    const phone = `090${String(Math.floor(Math.random() * 900) + 100)}${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const gradeLevel = pickRandom(GRADE_LEVELS);
    const parentLastName = pickRandom(LAST_NAMES);
    const parentName = `${parentLastName} Văn ${isMale ? 'Hùng' : 'Dũng'}`;

    allStudentData.push({ email, fullName, phone, gradeLevel, parentName });
  }

  const seededStudentsMap = new Map<string, Student>();
  let studentCount = 0;

  for (let i = 0; i < allStudentData.length; i++) {
    const item = allStudentData[i];
    const isMale = i % 2 === 0;
    const genderStr = isMale ? 'male' : 'female';
    const avatarNum = (i % 10) + 1;
    const avatarUrl = `https://storage.googleapis.com/banani-avatars/avatar%2F${genderStr}%2F18-25%2FSoutheast%20Asian%2F${avatarNum}`;

    const existingUser = await userRepo.findOneBy({ email: item.email });
    let student: Student;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Student123@', 4);
      const user = await userRepo.save(
        userRepo.create({
          email: item.email,
          passwordHash: hashedPassword,
          fullName: item.fullName,
          phone: item.phone,
          avatarUrl: avatarUrl,
          role: studentRole,
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
      studentCount++;
    } else {
      // Update avatar if missing
      if (!existingUser.avatarUrl) {
        existingUser.avatarUrl = avatarUrl;
        await userRepo.save(existingUser);
      }
      student = (await studentRepo.findOne({
        where: { user: { id: existingUser.id } },
      }))!;
      if (!student) {
        // User exists but student record was deleted — create new
        student = await studentRepo.save(
          studentRepo.create({
            user: existingUser,
            gradeLevel: item.gradeLevel,
            parentName: item.parentName,
            parentPhone: item.phone,
          }),
        );
        studentCount++;
      }
    }
    seededStudentsMap.set(item.email, student);
  }
  console.log(`   + Total students: ${seededStudentsMap.size}`);

  // ===================================================================
  // 7. CLASS REQUESTS (~120)
  // ===================================================================
  console.log('\n--- 7. Seeding Class Requests ---');
  const requestStatuses = [
    RequestStatus.PENDING,
    RequestStatus.PROCESSING,
    RequestStatus.MATCHED,
    RequestStatus.CANCELLED,
  ];
  const schedules = [
    'Tối Thứ 2, Thứ 4 · 19:00 - 21:00',
    'Sáng Thứ 7, Chủ nhật · 08:00 - 10:00',
    'Chiều Thứ 3, Thứ 5 · 17:30 - 19:30',
    'Tối Thứ 2, Thứ 5 · 18:00 - 20:00',
    'Sáng Thứ 3, Thứ 6 · 09:00 - 11:00',
    'Chiều Thứ 4, Thứ 7 · 14:00 - 16:00',
  ];
  const requirements = [
    'Ưu tiên gia sư ĐH Bách Khoa hoặc KHTN, có kinh nghiệm dạy kèm cấp 3.',
    'Cần gia sư thiện về phát âm, giao tiếp, có giáo trình nền tảng phù hợp.',
    'Gia sư có kinh nghiệm dạy kèm cấp 3, bổ trợ nâng cao.',
    'Cần gia sư nhiệt tình, kiên nhẫn với học sinh mất gốc.',
    'Ưu tiên gia sư nữ, có kinh nghiệm luyện thi đại học.',
    'Gia sư có thể dạy theo nhóm nhỏ 2-3 học sinh.',
    'Cần gia sư ở gần nhà, có thể dạy tại nhà học sinh.',
    'Gia sư là sinh viên năm 3 trở lên, có thành tích học tập tốt.',
  ];

  let requestCount = 0;
  const allStudentEmails = Array.from(seededStudentsMap.keys());
  const allSubjectNames = Array.from(subjectMap.values()).map((s) => s.name);

  // Create requests for ~120 random students
  const studentsForRequests = allStudentEmails
    .sort(() => Math.random() - 0.5)
    .slice(0, 120);

  for (const studentEmail of studentsForRequests) {
    const student = seededStudentsMap.get(studentEmail)!;
    const subjectName = pickRandom(allSubjectNames);
    const subject = subjectMap.get(subjectName)!;
    const area = pickRandom(AREAS);

    // Check if a similar request already exists
    const existingReq = await requestRepo.findOneBy({
      student: { id: student.id },
      subject: { id: subject.id },
    });
    if (existingReq) continue;

    await requestRepo.save(
      requestRepo.create({
        student,
        subject,
        preferredArea: area,
        preferredSchedule: pickRandom(schedules),
        requirements: pickRandom(requirements),
        status: pickRandom(requestStatuses),
      }),
    );
    requestCount++;
  }
  console.log(`   + Total class requests: ${requestCount}`);

  // ===================================================================
  // 8. CLASSES (~60 from matched/processing requests, plus hardcoded)
  // ===================================================================
  console.log('\n--- 8. Seeding Classes ---');

  // Lấy tất cả requests có status matched hoặc processing để tạo lớp
  const matchableRequests = await requestRepo.find({
    where: [
      { status: RequestStatus.MATCHED },
      { status: RequestStatus.PROCESSING },
      { status: RequestStatus.PENDING },
    ],
    relations: ['student', 'subject', 'student.user'],
    take: 60,
  });

  // Lấy tất cả tutors approved
  const approvedTutors = await tutorRepo.find({
    where: { approvalStatus: ApprovalStatus.APPROVED },
    relations: ['user'],
    take: 60,
  });

  let classCount = 0;
  const seededClasses: Class[] = [];

  // Hardcoded class mappings (from original seed)
  const chemSubject = subjectMap.get('Hóa học')!;
  const mathSubject = subjectMap.get('Toán học')!;
  const engSubject = subjectMap.get('Tiếng Anh')!;
  const litSubject = subjectMap.get('Ngữ văn')!;

  const hardcodedClassMappings = [
    {
      tutorEmail: 'tran_thi_cam@tutoredu.com',
      studentEmail: 'tran_my_duyen@tutoredu.com',
      subject: chemSubject,
      fee: 300000,
      total: 20,
      status: 'active' as any,
      location: 'Quận 7, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'tran_thi_cam@tutoredu.com',
      studentEmail: 'nguyen_thi_ha@tutoredu.com',
      subject: mathSubject,
      fee: 250000,
      total: 15,
      status: 'active' as any,
      location: 'Quận 7, TP.HCM',
      startDate: new Date('2026-06-01'),
    },
    {
      tutorEmail: 'nguyen_van_binh@tutoredu.com',
      studentEmail: 'le_trong_tan@tutoredu.com',
      subject: mathSubject,
      fee: 250000,
      total: 10,
      status: 'completed' as any,
      location: 'Quận 1, TP.HCM',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'phan_ngoc_ha@tutoredu.com',
      studentEmail: 'tran_my_duyen@tutoredu.com',
      subject: mathSubject,
      fee: 200000,
      total: 15,
      status: 'active' as any,
      location: 'Bình Thạnh, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'nguyen_minh_anh@tutoredu.com',
      studentEmail: 'le_trong_tan@tutoredu.com',
      subject: mathSubject,
      fee: 250000,
      total: 15,
      status: 'active' as any,
      location: 'Quận 1, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'tran_hoang_phuc@tutoredu.com',
      studentEmail: 'hoang_gia_bao@tutoredu.com',
      subject: mathSubject,
      fee: 300000,
      total: 15,
      status: 'active' as any,
      location: 'Quận 3, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'le_khanh_vy@tutoredu.com',
      studentEmail: 'ngo_minh_an@tutoredu.com',
      subject: mathSubject,
      fee: 180000,
      total: 15,
      status: 'active' as any,
      location: 'Bình Thạnh, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'pham_quoc_huy@tutoredu.com',
      studentEmail: 'pham_huu_duc@tutoredu.com',
      subject: mathSubject,
      fee: 220000,
      total: 15,
      status: 'active' as any,
      location: 'Thủ Đức, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'nguyen_tran_bao_ngoc@tutoredu.com',
      studentEmail: 'nguyen_thi_ha@tutoredu.com',
      subject: mathSubject,
      fee: 250000,
      total: 15,
      status: 'active' as any,
      location: 'Cầu Giấy, Hà Nội',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'le_hoang_nam@tutoredu.com',
      studentEmail: 'ngo_minh_an@tutoredu.com',
      subject: engSubject,
      fee: 350000,
      total: 15,
      status: 'active' as any,
      location: 'Quận 1, TP.HCM',
      startDate: new Date('2026-05-01'),
    },
    {
      tutorEmail: 'tran_thi_mai@tutoredu.com',
      studentEmail: 'pham_huu_duc@tutoredu.com',
      subject: litSubject,
      fee: 200000,
      total: 15,
      status: 'active' as any,
      location: 'Hải Châu, Đà Nẵng',
      startDate: new Date('2026-05-01'),
    },
  ];

  // Seed hardcoded classes
  for (const mapping of hardcodedClassMappings) {
    const tutor = seededTutorsMap.get(mapping.tutorEmail);
    const student = seededStudentsMap.get(mapping.studentEmail);
    if (!tutor || !student) continue;

    const existing = await classRepo.findOneBy({
      tutor: { id: tutor.id },
      student: { id: student.id },
    });
    if (!existing) {
      const newClass = await classRepo.save(
        classRepo.create({
          tutor,
          student,
          subject: mapping.subject,
          feePerSession: mapping.fee,
          totalSessions: mapping.total,
          status: mapping.status,
          startDate: mapping.startDate,
          endDate: mapping.endDate,
          location: mapping.location,
        }),
      );
      seededClasses.push(newClass);
      classCount++;
    } else {
      seededClasses.push(existing);
    }
  }

  // Seed classes from matched requests
  let matchIndex = 0;
  for (const req of matchableRequests) {
    if (matchIndex >= approvedTutors.length) break;
    const tutor = approvedTutors[matchIndex];
    const student = req.student;
    const subject = req.subject;

    const existing = await classRepo.findOneBy({
      tutor: { id: tutor.id },
      student: { id: student.id },
    });
    if (existing) {
      seededClasses.push(existing);
      matchIndex++;
      continue;
    }

    // Determine status based on request status
    let classStatus: ClassStatus;
    let startDate: Date;
    let endDate: Date | undefined;

    if (req.status === RequestStatus.MATCHED) {
      classStatus = ClassStatus.ACTIVE;
      startDate = new Date('2026-05-01');
      endDate = undefined;
    } else {
      classStatus = ClassStatus.ACTIVE;
      startDate = new Date('2026-05-15');
      endDate = undefined;
    }

    const fee = Math.floor((150 + Math.random() * 250) * 1000); // 150k-400k
    const totalSessions = Math.floor(10 + Math.random() * 20); // 10-30

    const newClass = await classRepo.save(
      classRepo.create({
        tutor,
        student,
        subject,
        feePerSession: fee,
        totalSessions,
        status: classStatus,
        startDate,
        endDate,
        location: req.preferredArea || pickRandom(AREAS),
      }),
    );
    seededClasses.push(newClass);
    classCount++;
    matchIndex++;
  }
  console.log(`   + Total classes: ${seededClasses.length}`);

  // ===================================================================
  // 9. SCHEDULES (~240: 4 sessions per class for all classes)
  // ===================================================================
  console.log('\n--- 9. Seeding Schedules ---');
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const timeSlots = [
    { start: '08:00:00', end: '10:00:00' },
    { start: '14:00:00', end: '16:00:00' },
    { start: '17:30:00', end: '19:30:00' },
    { start: '19:00:00', end: '21:00:00' },
  ];

  let scheduleCount = 0;
  for (const cls of seededClasses) {
    const total = cls.totalSessions || 10;
    const startDate = cls.startDate || new Date('2026-05-04');

    // Pick 2 recurring days per class (e.g., T2 + T5, or T3 + T6)
    const shuffledDays = [...dayNames].sort(() => Math.random() - 0.5);
    const classDays = shuffledDays
      .slice(0, 2)
      .sort((a, b) => dayNames.indexOf(a) - dayNames.indexOf(b));

    // Pick a consistent time slot for this class
    const timeSlot = pickRandom(timeSlots);

    // Find the first weekday (sessionDate) on or after startDate matching each classDay
    const getNthWeekday = (
      baseDate: Date,
      targetDay: string,
      nth: number,
    ): Date => {
      const result = new Date(baseDate);
      const targetIdx = dayNames.indexOf(targetDay); // 0=T2 → Monday
      // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
      // Map: T2=0 → Mon=1, T3=1 → Tue=2, ..., T7=6 → Sat=7, CN excluded
      const jsDay = targetIdx + 1; // T2=0→1(Mon), T3=1→2(Tue)...
      const currentDay = result.getDay(); // 0=Sun..6=Sat
      let diff = jsDay - currentDay;
      if (diff < 0) diff += 7;
      result.setDate(result.getDate() + diff + (nth - 1) * 7);
      return result;
    };

    // Distribute total sessions across the 2 recurring days
    let remaining = total;

    for (let d = 0; d < classDays.length; d++) {
      const day = classDays[d];
      const count = Math.ceil(remaining / (classDays.length - d));
      remaining -= count;
      for (let s = 0; s < count; s++) {
        const sessionDate = getNthWeekday(startDate, day, s + 1);

        // Check if schedule already exists for this class + date
        const existing = await scheduleRepo.findOneBy({
          class: { id: cls.id },
          sessionDate,
          startTime: timeSlot.start,
        });
        if (!existing) {
          await scheduleRepo.save(
            scheduleRepo.create({
              class: cls,
              sessionDate,
              dayOfWeek: day,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
              sessionStatus:
                cls.status === ClassStatus.COMPLETED
                  ? SessionStatus.COMPLETED
                  : SessionStatus.SCHEDULED,
              note: pickRandom(SCHEDULE_NOTES),
            }),
          );
          scheduleCount++;
        }
      }
    }
  }
  console.log(`   + Total schedules: ${scheduleCount}`);

  // ===================================================================
  // 10. REVIEWS (~50)
  // ===================================================================
  console.log('\n--- 10. Seeding Reviews ---');
  let reviewCount = 0;
  for (const cls of seededClasses) {
    // Only create reviews for COMPLETED classes (active classes shouldn't have reviews yet)
    if (cls.status !== ClassStatus.COMPLETED) continue;

    // Check if review already exists
    const existingReview = await reviewRepo.findOneBy({
      class: { id: cls.id },
      student: { id: cls.student.id },
    });
    if (existingReview) continue;

    const { rating, comment } = getRandomReviewComment();

    await reviewRepo.save(
      reviewRepo.create({
        class: cls,
        tutor: cls.tutor,
        student: cls.student,
        rating,
        comment,
      }),
    );
    reviewCount++;
  }
  console.log(`   + Total reviews: ${reviewCount}`);

  // ===================================================================
  // 11. LEARNING REPORTS (~240) — 1 báo cáo cho mỗi buổi học để demo đầy đủ
  // ===================================================================
  console.log('\n--- 11. Seeding Learning Reports ---');
  const progressRatings = [
    ProgressRating.POOR,
    ProgressRating.FAIR,
    ProgressRating.GOOD,
    ProgressRating.EXCELLENT,
  ];
  let reportCount = 0;

  // Danh sách email học viên hardcoded (có thể đăng nhập và xem calendar)
  const hardcodedStudentEmails = hardcodedStudents.map((s) => s.email);

  // Lấy tất cả schedules + class + tutor
  const allSchedules = await scheduleRepo.find({
    relations: ['class', 'class.tutor', 'class.student', 'class.student.user'],
    order: { sessionDate: 'ASC' },
  });

  for (const schedule of allSchedules) {
    const cls = schedule.class;
    if (!cls || !cls.tutor) continue;

    const sessionDate =
      schedule.sessionDate instanceof Date
        ? schedule.sessionDate
        : new Date(schedule.sessionDate);

    // Normalize sessionDate to start of day for consistent matching
    const normDate = new Date(sessionDate);
    normDate.setHours(0, 0, 0, 0);

    // Check if report already exists for this class + date (using Between to avoid precision issues)
    const dayStart = new Date(normDate);
    const dayEnd = new Date(normDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingReport = await reportRepo.findOne({
      where: {
        class: { id: cls.id },
        reportDate: Between(dayStart, dayEnd),
      },
    });
    if (existingReport) continue;

    // Ưu tiên tạo report cho tất cả schedules của hardcoded students (100%)
    // và ~70% schedules của các student khác
    const isHardcodedStudent =
      cls.student?.user?.email &&
      hardcodedStudentEmails.includes(cls.student.user.email);

    if (!isHardcodedStudent && Math.random() > 0.7) continue;

    await reportRepo.save(
      reportRepo.create({
        class: cls,
        tutor: cls.tutor,
        reportDate: normDate,
        content: pickRandom(REPORT_CONTENTS),
        homework: pickRandom(HOMEWORK_LIST),
        progressRating: pickRandom(progressRatings),
        attendanceStatus: Math.random() > 0.1, // 90% attendance
      }),
    );
    reportCount++;
  }
  console.log(`   + Total learning reports: ${reportCount}`);

  // ===================================================================
  // 12. NOTIFICATIONS (~60)
  // ===================================================================
  console.log('\n--- 12. Seeding Notifications ---');
  const notificationTypes = [
    NotificationType.NEW_REQUEST,
    NotificationType.CLASS_CONFIRMED,
    NotificationType.SCHEDULE_CHANGED,
    NotificationType.TUTOR_APPROVED,
  ];
  let notificationCount = 0;

  // Send notifications to a subset of users
  const usersForNotifications = await userRepo.find({
    take: 60,
    order: { createdAt: 'ASC' },
  });

  for (const user of usersForNotifications) {
    if (user.role.name === 'admin') continue; // Skip admin, they get too many
    const existingNotif = await notificationRepo.findOneBy({
      user: { id: user.id },
    });
    if (existingNotif) continue;

    await notificationRepo.save(
      notificationRepo.create({
        user,
        title: pickRandom(NOTIFICATION_TITLES),
        message: pickRandom(NOTIFICATION_MESSAGES),
        type: pickRandom(notificationTypes),
        isRead: Math.random() > 0.6,
      }),
    );
    notificationCount++;
  }
  console.log(`   + Total notifications: ${notificationCount}`);

  // ===================================================================
  // SUMMARY
  // ===================================================================
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalRecords =
    4 + // roles
    2 + // admin + staff
    9 + // subjects
    seededTutorsMap.size + // tutors
    seededStudentsMap.size + // students
    seededTutorsMap.size * 1.2 + // tutor_subjects (approx)
    requestCount +
    seededClasses.length +
    scheduleCount +
    reviewCount +
    reportCount +
    notificationCount;

  console.log('\n' + '='.repeat(60));
  console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`   ⏱ Time: ${elapsed}s`);
  console.log(`   📊 Total records: ~${Math.round(totalRecords)}`);
  console.log(`   👨‍🏫 Tutors: ${seededTutorsMap.size}`);
  console.log(`   👩‍🎓 Students: ${seededStudentsMap.size}`);
  console.log(`   📋 Class Requests: ${requestCount}`);
  console.log(`   📚 Classes: ${seededClasses.length}`);
  console.log(`   📅 Schedules: ${scheduleCount}`);
  console.log(`   ⭐ Reviews: ${reviewCount}`);
  console.log(`   📝 Learning Reports: ${reportCount}`);
  console.log(`   🔔 Notifications: ${notificationCount}`);
  console.log('='.repeat(60));

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
