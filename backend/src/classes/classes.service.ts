import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Class, ClassStatus } from './class.entity';
import { Schedule, SessionStatus } from './schedule.entity';
import { LearningReport } from './learning-report.entity';
import { CreateLearningReportDto } from './create-report.dto';
import { ClassRequest, RequestStatus } from './class-request.entity';
import { User } from '../users/entities/user.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { Role } from '../users/entities/role.entity';
import { Notification } from '../notifications/notification.entity';

@Injectable()
export class ClassesService implements OnModuleInit {
  // Khớp với ID của Nguyễn Minh Tuấn trong file SQL
  private readonly TEST_TUTOR_ID = '00000000-0000-0000-0003-000000000001';

  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(LearningReport)
    private readonly learningReportRepository: Repository<LearningReport>,
    @InjectRepository(ClassRequest)
    private readonly classRequestRepository: Repository<ClassRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async onModuleInit() {
    // Tự động seed nếu chưa có dữ liệu User
    const userCount = await this.userRepository.count();
    // if (userCount === 0) {
    //   console.log('--- Database is empty. Seeding initial data... ---');
    //   // Giả sử chúng ta seed cho một tutor ID cố định để test
    //   await this.seedMockData();
    // }
  }

  // Hàm dùng chung để lấy thông tin profile cho Header các trang
  async getTutorProfileData(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { user: { id: userId } },
      relations: ['user', 'user.role']
    });
    
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    return {
      id: tutorEntity.id,
      fullName: tutorEntity.user?.fullName || 'Gia sư',
      roleName: tutorEntity.user?.role?.name === 'tutor' ? 'Gia sư hệ thống' : tutorEntity.user?.role?.name || 'Người dùng',
      avatar: tutorEntity.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1", 
      email: tutorEntity.user?.email,
      phone: tutorEntity.user?.phone,
      address: tutorEntity.user?.address
    };
  }

  async getTutorDashboard(userId: string, targetDate?: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    // ==========================================
    // 1. LẤY DỮ LIỆU THỐNG KÊ (STATS)
    // ==========================================
    // Lấy tất cả lịch dạy của tuần này để tính giờ và thu nhập
    const baseDate = targetDate ? new Date(targetDate) : new Date();
    const currentDay = baseDate.getDay(); 
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklySchedules = await this.scheduleRepository.find({
      where: { class: { tutor: { id: tutorId } }, sessionDate: Between(monday, sunday) },
      relations: ['class']
    });

    const activeClasses = await this.classRepository.count({
      where: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE },
    });

    const totalHours = weeklySchedules.length * 2; // Giả sử mỗi buổi 2h
    const weeklyIncome = weeklySchedules
      .filter(s => s.sessionStatus === SessionStatus.COMPLETED)
      .reduce((acc, curr) => acc + Number(curr.class?.feePerSession || 0), 0);

    const stats = [
      { label: 'Lớp đang phụ trách', value: activeClasses.toString(), icon: 'lucide:book-open', color: 'blue' },
      { label: 'Giờ dạy tuần này', value: `${totalHours}h`, icon: 'lucide:clock', color: 'green' },
      { label: 'Đánh giá trung bình', value: '5.0', sub: '/5.0', icon: 'lucide:star', color: 'orange' },
      { label: 'Thu nhập thực tế', value: `${weeklyIncome.toLocaleString('vi-VN')}đ`, icon: 'lucide:wallet', color: 'purple' },
    ];

    // Lấy Suggested Classes từ database (ClassRequest)
    const requests = await this.classRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['subject', 'student', 'student.user'],
      take: 4,
    });

    const suggestedClasses = requests.map(req => ({
      id: req.id,
      subject: req.subject?.name || 'Môn học mới',
      location: req.preferredArea || 'Toàn quốc',
      schedule: req.preferredSchedule || 'Linh hoạt',
      price: 'Thỏa thuận',
      isNew: true
    }));

    // ==========================================
    // 2. LẤY DỮ LIỆU LỊCH DẠY TUẦN NÀY
    // ==========================================
    // (Đã lấy weeklySchedules ở trên, bổ sung relations để map)
    const fullWeeklySchedules = await this.scheduleRepository.find({
      where: { class: { tutor: { id: tutorId } }, sessionDate: Between(monday, sunday) },
      relations: ['class', 'class.student', 'class.student.user', 'class.subject'],
    });

    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const calendar = daysOfWeek.map((dayLabel, index) => {
      const dateOfThisDay = new Date(monday);
      dateOfThisDay.setDate(monday.getDate() + index);
      const dateStr = dateOfThisDay.getDate().toString();
      const isToday = dateOfThisDay.toDateString() === new Date().toDateString();

      const scheduleForDay = fullWeeklySchedules.find(
        (s) => s.sessionDate && new Date(s.sessionDate).toDateString() === dateOfThisDay.toDateString()
      );

      return {
        day: dayLabel,
        date: dateStr,
        isToday,
        event: scheduleForDay ? {
          time: `${scheduleForDay.startTime} - ${scheduleForDay.endTime}`, 
          title: scheduleForDay.class?.subject?.name || 'Môn học',
          student: scheduleForDay.class?.student?.user?.fullName || 'Học viên',
          color: 'blue' 
        } : null,
      };
    });

    // ==========================================
    // 3. LẤY DANH SÁCH LỚP ĐANG PHỤ TRÁCH
    // ==========================================
    const myClasses = await this.classRepository.find({
      where: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE },
      relations: ['student', 'student.user', 'subject'],
      take: 5,
    });

    const currentClasses = await Promise.all(myClasses.map(async cls => {
      const completedCount = await this.scheduleRepository.count({
        where: { class: { id: cls.id }, sessionStatus: SessionStatus.COMPLETED }
      });
      const total = cls.totalSessions || 1;

      return {
        id: `#L${cls.id?.substring(0, 4).toUpperCase() || 'XXXX'}`,
        rawId: cls.id, // Bổ sung ID gốc để Frontend gọi API
        subject: cls.subject?.name || 'Chưa cập nhật',
        type: cls.location?.toLowerCase().includes('online') ? 'Trực tuyến' : 'Tại nhà', 
        student: cls.student?.user?.fullName || 'Chưa có',
        initials: cls.student?.user?.fullName?.substring(0, 2).toUpperCase() || 'NA',
        schedule: 'Hàng tuần', 
        progress: Math.round((completedCount / total) * 100), 
        sessions: `${completedCount}/${total}`, 
        status: 'success'
      };
    }));

    return { stats, calendar, currentClasses, suggestedClasses, profile };
  }

  async getAvailableClasses(userId?: string) {
    const profile = userId ? await this.getTutorProfileData(userId) : null;
    const requests = await this.classRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['student', 'student.user', 'subject'],
      order: { createdAt: 'DESC' },
    });

    const classes = requests.map(req => ({
      id: req.id,
      code: `#LH${req.id.substring(0, 4).toUpperCase()}`,
      title: `Tìm gia sư ${req.subject?.name || 'môn học'}`,
      mode: req.preferredArea?.toLowerCase().includes('online') ? 'Online' : 'Offline',
      levelTag: req.student?.gradeLevel || 'Mọi cấp độ',
      location: req.preferredArea || 'Toàn quốc',
      schedule: req.preferredSchedule || 'Linh hoạt',
      studentInfo: `${req.student?.gradeLevel || 'Cấp độ học viên'} · ${req.student?.user?.fullName || 'Ẩn danh'}`,
      salary: 'Thỏa thuận',
      status: 'MỚI',
      postedAt: 'Vừa xong'
    }));

    return { classes, profile };
  }

  async findScheduleByTutor(userId: string, targetDate?: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    // Logic tính toán tuần giống Dashboard
    const baseDate = targetDate ? new Date(targetDate) : new Date();
    const currentDay = baseDate.getDay(); 
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklySchedules = await this.scheduleRepository.find({
      where: {
        class: { tutor: { id: tutorId } },
        sessionDate: Between(monday, sunday),
      },
      relations: ['class', 'class.student', 'class.student.user', 'class.subject'],
      order: { startTime: 'ASC' }
    });

    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    const calendar = daysOfWeek.map((dayLabel, index) => {
      const dateOfThisDay = new Date(monday);
      dateOfThisDay.setDate(monday.getDate() + index);
      
      const daySchedules = weeklySchedules.filter(
        (s) => s.sessionDate && new Date(s.sessionDate).toDateString() === dateOfThisDay.toDateString()
      );

      return {
        day: dayLabel,
        date: dateOfThisDay.getDate().toString(),
        isToday: dateOfThisDay.toDateString() === new Date().toDateString(),
        events: daySchedules.map(s => ({
          id: s.id,
          time: `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`,
          subject: s.class?.subject?.name || 'Môn học',
          student: s.class?.student?.user?.fullName || 'Học viên',
          location: s.class?.location || 'Online',
        }))
      };
    });

    return { calendar, profile };
  }

  async getTutorStudents(userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    // Lấy tất cả lớp học để lọc ra danh sách học viên
    const classes = await this.classRepository.find({
      where: { tutor: { id: tutorId } },
      relations: ['student', 'student.user', 'subject'],
    });

    // Lọc trùng học viên vì một học viên có thể học nhiều môn với cùng 1 gia sư
    const studentMap = new Map();
    classes.forEach(cls => {
      if (cls.student && !studentMap.has(cls.student.id)) {
        studentMap.set(cls.student.id, {
          id: cls.student.id,
          fullName: cls.student.user?.fullName || 'Học viên',
          gradeLevel: cls.student.gradeLevel || 'Chưa cập nhật',
          avatar: cls.student.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F13-17%2FSoutheast%20Asian%2F2", // Lấy từ user.avatarUrl
          email: cls.student.user?.email,
          phone: cls.student.user?.phone,
          status: cls.status === ClassStatus.ACTIVE ? 'Đang học' : 'Đã kết thúc',
          lastSubject: cls.subject?.name,
          createdAt: cls.student.user?.createdAt || new Date()
        });
      }
    });

    return { students: Array.from(studentMap.values()), profile };
  }

  async getClassRequestDetail(id: string) {
    const request = await this.classRequestRepository.findOne({
      where: { id },
      relations: ['student', 'student.user', 'subject'],
    });
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu lớp học');
    return request;
  }

  async acceptClassRequest(requestId: string, userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const request = await this.classRequestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'subject'],
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu lớp học');
    if (request.status !== RequestStatus.PENDING) throw new ForbiddenException('Lớp học này đã có người nhận hoặc không còn khả dụng');

    // 1. Cập nhật trạng thái yêu cầu
    request.status = RequestStatus.MATCHED;
    await this.classRequestRepository.save(request);

    // 2. Tạo lớp học mới
    const newClass = this.classRepository.create({
      tutor: { id: tutorId },
      student: request.student,
      subject: request.subject,
      request: request,
      location: request.preferredArea,
      feePerSession: 200000, // Mặc định hoặc lấy từ logic thỏa thuận
      status: ClassStatus.ACTIVE,
      startDate: new Date(),
      notes: request.requirements,
    });

    return this.classRepository.save(newClass);
  }

  async getNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } }, // Truy vấn chính xác thông qua quan hệ
      order: { createdAt: 'DESC' },
      take: 10, // Lấy 10 thông báo mới nhất
    });
  }

  async updateTutorProfile(userId: string, updateData: any) {
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { user: { id: userId } }, 
      relations: ['user'] 
    });
    
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy gia sư');

    // Cập nhật thông tin bảng User
    if (updateData.fullName) tutorEntity.user.fullName = updateData.fullName;
    if (updateData.phone) tutorEntity.user.phone = updateData.phone;
    if (updateData.address) tutorEntity.user.address = updateData.address;
    if (updateData.avatarUrl) tutorEntity.user.avatarUrl = updateData.avatarUrl;
    await this.userRepository.save(tutorEntity.user);

    // Cập nhật thông tin bảng Tutor (Ví dụ: kinh nghiệm)
    if (updateData.experience) tutorEntity.experience = updateData.experience;
    await this.tutorRepository.save(tutorEntity);

    return { 
      message: 'Cập nhật hồ sơ thành công', 
      profile: await this.getTutorProfileData(userId) 
    };
  }

  async getReportsByClass(classId: string, userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    return this.learningReportRepository.find({
      where: { class: { id: classId }, tutor: { id: tutorId } },
      order: { reportDate: 'DESC' }
    });
  }

  async updateReport(reportId: string, userId: string, dto: Partial<CreateLearningReportDto>) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const report = await this.learningReportRepository.findOne({
      where: { id: reportId, tutor: { id: tutorId } }
    });
    if (!report) throw new NotFoundException('Không tìm thấy báo cáo');
    
    Object.assign(report, dto);
    return this.learningReportRepository.save(report);
  }

  async deleteReport(reportId: string, userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const result = await this.learningReportRepository.delete({ id: reportId, tutor: { id: tutorId } });
    if (result.affected === 0) throw new NotFoundException('Không tìm thấy báo cáo để xóa');
    return { message: 'Xóa báo cáo thành công' };
  }

  async createReport(userId: string, dto: CreateLearningReportDto) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id; // Lấy Tutor Entity ID thực tế

    const classInstance = await this.classRepository.findOne({
      where: { id: dto.classId },
      relations: ['tutor'],
    });

    if (!classInstance) throw new NotFoundException(`Không tìm thấy lớp học với ID ${dto.classId}`);
    if (classInstance.tutor.id !== tutorId) throw new ForbiddenException('Bạn không có quyền nộp báo cáo.');

    // Giải quyết lỗi: Tách classId từ DTO để map vào quan hệ object thay vì để string trực tiếp
    const { classId, ...reportData } = dto;

    const newReport = this.learningReportRepository.create({
      ...reportData,
      class: { id: classId },
      tutor: { id: tutorId },
      reportDate: new Date(),
    });

    return this.learningReportRepository.save(newReport);
  }

  async seedMockData() {
    // 1. Tạo hoặc lấy Role mẫu (Sử dụng findOne để tránh lỗi Unique Constraint)
    let tutorRole = await this.roleRepository.findOne({ where: { name: 'tutor' } });
    if (!tutorRole) {
      tutorRole = await this.roleRepository.save(this.roleRepository.create({ name: 'tutor' }));
    }

    let studentRole = await this.roleRepository.findOne({ where: { name: 'student' } });
    if (!studentRole) {
      studentRole = await this.roleRepository.save(this.roleRepository.create({ name: 'student' }));
    }

    // 2. Tạo hoặc lấy User & Tutor/Student mẫu
    let tutorUser = await this.userRepository.findOne({ where: { email: 'tutor@test.com' } });
    if (!tutorUser) {
      tutorUser = await this.userRepository.save(this.userRepository.create({
        id: this.TEST_TUTOR_ID, // Gán ID cố định để khớp với Controller
        fullName: 'Gia sư Mẫu',
        email: 'tutor@test.com',
        passwordHash: '123456',
        role: tutorRole
      }));
    }
    let tutor = await this.tutorRepository.findOne({ where: { user: { id: tutorUser.id } } });
    if (!tutor) {
      tutor = await this.tutorRepository.save(this.tutorRepository.create({ user: tutorUser }));
    }

    let studentUser = await this.userRepository.findOne({ where: { email: 'student@test.com' } });
    if (!studentUser) {
      studentUser = await this.userRepository.save(this.userRepository.create({
        fullName: 'Học viên Mẫu',
        email: 'student@test.com',
        passwordHash: '123456',
        role: studentRole
      }));
    }
    let student = await this.studentRepository.findOne({ where: { user: { id: studentUser.id } } });
    if (!student) {
      student = await this.studentRepository.save(this.studentRepository.create({ user: studentUser, gradeLevel: 'Lớp 12' }));
    }

    // 3. Tạo hoặc lấy Subject
    let math = await this.subjectRepository.findOne({ where: { name: 'Toán học' } });
    if (!math) {
      math = await this.subjectRepository.save(this.subjectRepository.create({ name: 'Toán học' }));
    }

    let english = await this.subjectRepository.findOne({ where: { name: 'Tiếng Anh' } });
    if (!english) {
      english = await this.subjectRepository.save(this.subjectRepository.create({ name: 'Tiếng Anh' }));
    }

    // 4. Tạo Class & Schedule (Chỉ tạo nếu chưa có lớp nào)
    const existingClass = await this.classRepository.count({ where: { tutor: { id: tutor.id } } });
    if (existingClass === 0) {
    const cls = await this.classRepository.save(this.classRepository.create({
      tutor, student, subject: math, status: ClassStatus.ACTIVE, feePerSession: 200000
    }));

    const today = new Date();
    await this.scheduleRepository.save(this.scheduleRepository.create({
      class: cls,
      sessionDate: today,
      startTime: '19:00',
      endTime: '21:00',
      dayOfWeek: 'Today'
    }));

    // Tạo Class Requests (New Classes)
    await this.classRequestRepository.save([
      this.classRequestRepository.create({
        student, subject: math, preferredArea: 'Quận 1, TP.HCM', preferredSchedule: 'Tối T2, T4', status: RequestStatus.PENDING
      }),
      this.classRequestRepository.create({
        student, subject: english, preferredArea: 'Online', preferredSchedule: 'Sáng CN', status: RequestStatus.PENDING
      }),
      this.classRequestRepository.create({
        student,
        subject: math,
        preferredArea: 'Quận 7, TP.HCM',
        preferredSchedule: 'Chiều T7, CN',
        requirements: 'Cần gia sư dạy nâng cao toán hình lớp 11.',
        status: RequestStatus.PENDING
      }),
      this.classRequestRepository.create({
        student,
        subject: english,
        preferredArea: 'Quận Bình Thạnh, TP.HCM',
        preferredSchedule: 'Tối T3, T5',
        requirements: 'Gia sư luyện thi IELTS, mục tiêu 6.5.',
        status: RequestStatus.PENDING
      })
    ]);
    }
  }
}
