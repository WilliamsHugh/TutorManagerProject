import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThanOrEqual, Not } from 'typeorm';

// Entities
import { Class, ClassStatus } from '../classes/entities/class.entity';
import { Schedule, SessionStatus } from '../classes/entities/schedule.entity';
import { LearningReport } from '../classes/entities/learning-report.entity';
import {
  ClassRequest,
  RequestStatus,
} from '../classes/entities/class-request.entity';
import { User } from '../users/entities/user.entity';
import { Tutor, ApprovalStatus } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { Role } from '../users/entities/role.entity';
import { Notification } from '../notifications/notification.entity';
import { TutorSubject } from './tutor-subject.entity';
import { Review } from '../classes/entities/review.entity';
import { CreateLearningReportDto } from '../classes/dto/create-learning-report.dto';

@Injectable()
export class TutorsService implements OnModuleInit {
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
    @InjectRepository(TutorSubject)
    private readonly tutorSubjectRepository: Repository<TutorSubject>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async onModuleInit() {
    // Tự động gộp và dọn dẹp các môn học cũ (Toán -> Toán học, Lý -> Vật lí, Hóa -> Hóa học)
    const mergeSubject = async (oldName: string, newName: string) => {
      // Tìm tất cả các môn học cũ (bao gồm cả trường hợp có nhiều môn trùng tên do lỗi dữ liệu)
      const oldSubs = await this.subjectRepository.find({
        where: { name: oldName },
      });
      if (oldSubs.length === 0) return;

      const newSub = await this.subjectRepository.findOne({
        where: { name: newName },
      });
      if (newSub) {
        for (const oldSub of oldSubs) {
          if (oldSub.id === newSub.id) continue;

          // 1. Gộp liên kết trong TutorSubject sang môn mới
          const tsList = await this.tutorSubjectRepository.find({
            where: { subject: { id: oldSub.id } },
          });
          for (const ts of tsList) {
            ts.subject = newSub;
            try {
              await this.tutorSubjectRepository.save(ts);
            } catch (err) {
              // Nếu đã có liên kết môn này rồi (tránh trùng lặp do unique constraint), xóa liên kết cũ dư thừa
              await this.tutorSubjectRepository.delete(ts.id);
            }
          }

          // 2. Gộp liên kết trong Class sang môn mới
          const classList = await this.classRepository.find({
            where: { subject: { id: oldSub.id } },
          });
          for (const cls of classList) {
            cls.subject = newSub;
            await this.classRepository.save(cls);
          }

          // 3. Gộp liên kết trong ClassRequest sang môn mới
          const reqList = await this.classRequestRepository.find({
            where: { subject: { id: oldSub.id } },
          });
          for (const req of reqList) {
            req.subject = newSub;
            await this.classRequestRepository.save(req);
          }

          // 4. Xóa môn học cũ
          try {
            await this.subjectRepository.delete(oldSub.id);
            console.log(
              `Merged duplicate subject '${oldName}' into '${newName}' and deleted the old one.`,
            );
          } catch (deleteError) {
            console.error(
              `Failed to delete old subject '${oldName}':`,
              deleteError,
            );
          }
        }
      } else {
        // Nếu chưa có môn mới, lấy môn cũ đầu tiên đổi tên, các môn cũ trùng tên khác (nếu có) sẽ gộp vào môn đầu tiên này
        const firstOldSub = oldSubs[0];
        firstOldSub.name = newName;
        await this.subjectRepository.save(firstOldSub);
        console.log(`Renamed subject '${oldName}' to '${newName}'.`);

        if (oldSubs.length > 1) {
          for (let i = 1; i < oldSubs.length; i++) {
            const oldSub = oldSubs[i];

            const tsList = await this.tutorSubjectRepository.find({
              where: { subject: { id: oldSub.id } },
            });
            for (const ts of tsList) {
              ts.subject = firstOldSub;
              try {
                await this.tutorSubjectRepository.save(ts);
              } catch (err) {
                await this.tutorSubjectRepository.delete(ts.id);
              }
            }

            const classList = await this.classRepository.find({
              where: { subject: { id: oldSub.id } },
            });
            for (const cls of classList) {
              cls.subject = firstOldSub;
              await this.classRepository.save(cls);
            }

            const reqList = await this.classRequestRepository.find({
              where: { subject: { id: oldSub.id } },
            });
            for (const req of reqList) {
              req.subject = firstOldSub;
              await this.classRequestRepository.save(req);
            }

            await this.subjectRepository.delete(oldSub.id);
          }
        }
      }
    };

    await mergeSubject('Toán', 'Toán học');
    await mergeSubject('Toán Học', 'Toán học');
    await mergeSubject('Lý', 'Vật lí');
    await mergeSubject('Vật Lý', 'Vật lí');
    await mergeSubject('Vật lý', 'Vật lí');
    await mergeSubject('Hóa', 'Hóa học');
    await mergeSubject('Hóa Học', 'Hóa học');

    // Tự động seed tài khoản student@test.com và tutor@test.com nếu chưa tồn tại
    const studentExists = await this.userRepository.findOne({
      where: { email: 'student@test.com' },
    });
    if (!studentExists) {
      console.log(
        '--- Student user not found. Seeding mock tutor and student accounts into database... ---',
      );
      await this.seedMockData();
    }

    // Tự động dọn dẹp các lịch học trùng lặp (trùng class, ngày và giờ) khi khởi chạy module
    try {
      const allSchedules = await this.scheduleRepository.find({
        relations: ['class'],
      });
      const groups = new Map<string, Schedule[]>();
      for (const s of allSchedules) {
        const classId = s.class?.id || 'no-class';
        const dateObj =
          s.sessionDate instanceof Date
            ? s.sessionDate
            : new Date(s.sessionDate);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const startTime = s.startTime || 'no-start';
        const endTime = s.endTime || 'no-end';
        const key = `${classId}_${dateStr}_${startTime}_${endTime}`;

        const list = groups.get(key) || [];
        list.push(s);
        groups.set(key, list);
      }

      let deletedCount = 0;
      for (const [key, list] of groups.entries()) {
        if (list.length > 1) {
          const toDelete = list.slice(1);
          for (const d of toDelete) {
            await this.scheduleRepository.delete(d.id);
            deletedCount++;
          }
        }
      }
      if (deletedCount > 0) {
        console.log(
          `--- Cleaned up ${deletedCount} duplicate schedules from the database successfully! ---`,
        );
      }
    } catch (err) {
      console.error('Error during automatic duplicate schedule cleanup:', err);
    }

    // Xóa lịch học của Nguyễn Thị Hà từ 17-19h theo yêu cầu
    try {
      const schedulesToDelete = await this.scheduleRepository.find({
        where: {
          class: { student: { user: { email: 'nguyen_thi_ha@tutoredu.com' } } },
          startTime: '17:00:00',
          endTime: '19:00:00',
        },
        relations: ['class', 'class.student', 'class.student.user'],
      });

      if (schedulesToDelete.length > 0) {
        const ids = schedulesToDelete.map((s) => s.id);
        await this.scheduleRepository.delete(ids);
        console.log(
          `--- Deleted ${schedulesToDelete.length} schedules of Nguyễn Thị Hà from 17:00-19:00 ---`,
        );
      }
    } catch (err) {
      console.error('Error deleting Nguyễn Thị Hà schedules:', err);
    }

    // Seed completed schedules để test earnings
    await this.seedEarningsTestData();
  }

  // Hàm dùng chung để lấy thông tin profile cho Header các trang
  async getTutorProfileData(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.role'],
    });

    if (!tutorEntity)
      throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    // Lấy danh sách môn học của gia sư
    const tutorSubjects = await this.tutorSubjectRepository.find({
      where: { tutor: { id: tutorEntity.id } },
      relations: ['subject'],
    });
    const subjects = tutorSubjects
      .map((ts) => ts.subject?.name)
      .filter(Boolean);

    return {
      id: tutorEntity.id,
      fullName: tutorEntity.user?.fullName || 'Gia sư',
      roleName: tutorEntity.user?.role?.name === 'tutor' ? 'Gia sư hệ thống' : tutorEntity.user?.role?.name || 'Người dùng',
      avatar: tutorEntity.user?.avatarUrl || null, 
      avatarUrl: tutorEntity.user?.avatarUrl || null,
      email: tutorEntity.user?.email,
      phone: tutorEntity.user?.phone,
      address: tutorEntity.user?.address,
      dob: tutorEntity.dateOfBirth
        ? new Date(tutorEntity.dateOfBirth).toISOString().split('T')[0]
        : '',
      educationLevel: tutorEntity.educationLevel || '',
      major: tutorEntity.major || '',
      experience: tutorEntity.experience || '',
      availableAreas: tutorEntity.availableAreas || '',
      bio: tutorEntity.bio || '',
      university: tutorEntity.university || '',
      graduationYear: tutorEntity.graduationYear || '',
      subjects,
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
      where: {
        class: { tutor: { id: tutorId }, status: Not(ClassStatus.CANCELLED) },
        sessionDate: Between(monday, sunday),
      },
      relations: ['class'],
    });

    const activeClasses = await this.classRepository.count({
      where: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE },
    });

    const totalHours = weeklySchedules.length * 2; // Giả sử mỗi buổi 2h
    const weeklyIncome = weeklySchedules
      .filter((s) => s.sessionStatus === SessionStatus.COMPLETED)
      .reduce((acc, curr) => acc + Number(curr.class?.feePerSession || 0), 0);

    // Tính tổng thu nhập tất cả các thời kỳ bằng QueryBuilder (Tối ưu Memory Leak)
    const earningsData = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoin('schedule.class', 'class')
      .where('class.tutor = :tutorId', { tutorId })
      .andWhere('schedule.sessionDate <= :today', { today: new Date() })
      .andWhere('schedule.sessionStatus != :cancelledStatus', { cancelledStatus: SessionStatus.CANCELLED })
      .select('SUM(class.fee_per_session)', 'totalEarnings')
      .addSelect('COUNT(schedule.id)', 'totalSessions')
      .getRawOne();

    const totalEarnings = Number(earningsData?.totalEarnings || 0);
    const totalCompletedSessions = Number(earningsData?.totalSessions || 0);

    const stats = [
      { label: 'Lớp đang phụ trách', value: activeClasses.toString(), icon: 'lucide:book-open', color: 'blue' },
      { label: 'Giờ dạy tuần này', value: `${totalHours}h`, icon: 'lucide:clock', color: 'green' },
      { 
        label: 'Tổng thu nhập', 
        value: `${totalEarnings.toLocaleString('vi-VN')}đ`, 
        sub: weeklyIncome > 0 ? `Tuần này: ${weeklyIncome.toLocaleString('vi-VN')}đ` : `${totalCompletedSessions} buổi đã dạy`,
        icon: 'lucide:wallet', 
        color: 'purple' 
      },
    ];

    // Query đánh giá trung bình thực tế từ bảng Review
    const reviewStats = await this.reviewRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .where('r.tutor_id = :tutorId', { tutorId })
      .getRawOne();
    const avgRating = reviewStats?.avgRating ? Number(reviewStats.avgRating).toFixed(1) : '0';
    const reviewCount = Number(reviewStats?.reviewCount || 0);

    stats.splice(2, 0, {
      label: 'Đánh giá trung bình',
      value: avgRating,
      sub: reviewCount > 0 ? `${reviewCount} đánh giá` : 'Chưa có đánh giá',
      icon: 'lucide:star',
      color: 'orange'
    });

    // Lấy Suggested Classes từ database (ClassRequest)
    const requests = await this.classRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['subject', 'student', 'student.user'],
      take: 4,
    });

    const suggestedClasses = requests.map((req) => ({
      id: req.id,
      subject: req.subject?.name || 'Môn học mới',
      location: req.preferredArea || 'Toàn quốc',
      schedule: req.preferredSchedule || 'Linh hoạt',
      price: req.budget ? `${Number(req.budget).toLocaleString('vi-VN')}đ/buổi` : 'Thỏa thuận',
      isNew: true,
    }));

    // ==========================================
    // 2. LẤY DỮ LIỆU LỊCH DẠY TUẦN NÀY
    // ==========================================
    const fullWeeklySchedules = await this.scheduleRepository.find({
      where: {
        class: { tutor: { id: tutorId }, status: Not(ClassStatus.CANCELLED) },
        sessionDate: Between(monday, sunday),
      },
      relations: [
        'class',
        'class.student',
        'class.student.user',
        'class.subject',
      ],
      order: { startTime: 'ASC' },
    });

    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const calendar = daysOfWeek.map((dayLabel, index) => {
      const dateOfThisDay = new Date(monday);
      dateOfThisDay.setDate(monday.getDate() + index);
      const dateStr = dateOfThisDay.getDate().toString();
      const isToday =
        dateOfThisDay.toDateString() === new Date().toDateString();

      const schedulesForDay = fullWeeklySchedules.filter(
        (s) => s.sessionDate && new Date(s.sessionDate).toDateString() === dateOfThisDay.toDateString()
      );

      return {
        day: dayLabel,
        date: dateStr,
        isToday,
        events: schedulesForDay.map(s => ({
          time: `${s.startTime} - ${s.endTime}`,
          title: s.class?.subject?.name || 'Môn học',
          student: s.class?.student?.user?.fullName || 'Học viên',
          color: 'blue'
        })),
      };
    });

    // ==========================================
    // 3. LẤY DANH SÁCH LỚP ĐANG PHỤ TRÁCH
    // ==========================================
    const myClasses = await this.classRepository.find({
      where: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE },
      relations: ['student', 'student.user', 'subject'],
    });

    const currentClasses = await Promise.all(myClasses.map(async cls => {
      const completedCount = await this.scheduleRepository.count({
        where: [
          { class: { id: cls.id }, sessionStatus: SessionStatus.COMPLETED },
          { class: { id: cls.id }, sessionDate: LessThanOrEqual(new Date()), sessionStatus: SessionStatus.SCHEDULED }
        ]
      });
      const total = cls.totalSessions || 1;

      return {
        id: `#L${cls.id?.substring(0, 4).toUpperCase() || 'XXXX'}`,
        rawId: String(cls.id), // Đảm bảo trả về chuỗi UUID chính xác
        studentId: cls.student?.id || '',
        subject: cls.subject?.name || 'Chưa cập nhật',
        type: cls.location?.toLowerCase()?.includes('online') ? 'Trực tuyến' : 'Tại nhà', 
        student: cls.student?.user?.fullName || 'Chưa có',
        initials: cls.student?.user?.fullName?.substring(0, 2).toUpperCase() || 'NA',
        schedule: 'Hàng tuần', 
        progress: Math.round((completedCount / total) * 100), 
        sessions: `${completedCount}/${total}`, 
        completedSessions: completedCount,
        totalSessions: total,
        status: 'success'
      };
    }));

    return { stats, calendar, currentClasses, suggestedClasses, profile };
  }

  async findScheduleByTutor(
    userId: string,
    targetDate?: string,
    view: string = 'week',
  ): Promise<any> {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const baseDate = targetDate ? new Date(targetDate) : new Date();
    let start: Date;
    let end: Date;

    if (view === 'month') {
      start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      end = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
    } else if (view === 'day') {
      start = new Date(baseDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(baseDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const day = baseDate.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start = new Date(baseDate);
      start.setDate(baseDate.getDate() + diff);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const schedules = await this.scheduleRepository.find({
      where: {
        class: { tutor: { id: tutorId }, status: Not(ClassStatus.CANCELLED) },
        sessionDate: Between(start, end),
      },
      relations: [
        'class',
        'class.student',
        'class.student.user',
        'class.subject',
      ],
      order: { startTime: 'ASC' },
    });

    const mapEvent = (s: Schedule) => ({
      id: s.id,
      date: s.sessionDate,
      time: `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`,
      subject: s.class?.subject?.name || 'Môn học',
      student: s.class?.student?.user?.fullName || 'Học viên',
      location: s.class?.location || 'Online',
      status: s.sessionStatus,
      note: s.note || null,
    });

    if (view === 'month' || view === 'day') {
      return { events: schedules.map(mapEvent), profile };
    }

    const daysOfWeek = [
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
      'Chủ nhật',
    ];
    const calendar = daysOfWeek.map((dayLabel, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const daySchedules = schedules.filter(
        (s) =>
          s.sessionDate &&
          new Date(s.sessionDate).toDateString() === date.toDateString(),
      );

      return {
        day: dayLabel,
        date: date.getDate().toString(),
        isToday: date.toDateString() === new Date().toDateString(),
        events: daySchedules.map(mapEvent),
      };
    });

    return { calendar, profile };
  }

  async getTutorStudents(userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    // Lấy raw data bằng QueryBuilder để tránh fetch toàn bộ object (Tối ưu Memory)
    const rawClasses = await this.classRepository
      .createQueryBuilder('class')
      .leftJoin('class.student', 'student')
      .leftJoin('student.user', 'user')
      .leftJoin('class.subject', 'subject')
      .where('class.tutor = :tutorId', { tutorId })
      .select([
        'student.id AS "studentId"',
        'user.full_name AS "fullName"',
        'student.grade_level AS "gradeLevel"',
        'user.avatar_url AS "avatarUrl"',
        'user.email AS "email"',
        'user.phone AS "phone"',
        'user.created_at AS "createdAt"',
        'class.status AS "status"',
        'subject.name AS "subjectName"',
      ])
      .getRawMany();

    // Lọc trùng học viên vì một học viên có thể học nhiều môn với cùng 1 gia sư
    const studentMap = new Map();
    rawClasses.forEach(cls => {
      if (cls.studentId) {
        if (!studentMap.has(cls.studentId)) {
          studentMap.set(cls.studentId, {
            id: cls.studentId,
            fullName: cls.fullName || 'Học viên',
            gradeLevel: cls.gradeLevel || 'Chưa cập nhật',
            avatar: cls.avatarUrl || null, 
            email: cls.email,
            phone: cls.phone,
            status: cls.status === ClassStatus.ACTIVE ? 'Đang học' : 'Đã kết thúc',
            lastSubject: cls.subjectName,
            subjects: [cls.subjectName].filter(Boolean),
            createdAt: cls.createdAt || new Date()
          });
        } else {
          const existing = studentMap.get(cls.studentId);
          if (cls.subjectName && !existing.subjects.includes(cls.subjectName)) {
            existing.subjects.push(cls.subjectName);
            existing.lastSubject = existing.subjects.join(', ');
          }
          if (cls.status === ClassStatus.ACTIVE) {
            existing.status = 'Đang học';
          }
        }
      }
    });

    return { students: Array.from(studentMap.values()), profile };
  }

  async getAvailableClasses(userId?: string) {
    const profile = userId ? await this.getTutorProfileData(userId) : null;
    const requests = await this.classRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['student', 'student.user', 'subject'],
      order: { createdAt: 'DESC' },
    });

    const classes = requests.map((req) => ({
      id: req.id,
      code: `#LH${req.id.substring(0, 4).toUpperCase()}`,
      title: `Tìm gia sư ${req.subject?.name || 'môn học'}`,
      mode: req.preferredArea?.toLowerCase()?.includes('online') ? 'Online' : 'Offline',
      levelTag: req.student?.gradeLevel || 'Mọi cấp độ',
      location: req.preferredArea || 'Toàn quốc',
      schedule: req.preferredSchedule || 'Linh hoạt',
      studentInfo: `${req.student?.gradeLevel || 'Cấp độ học viên'} · ${req.student?.user?.fullName || 'Ẩn danh'}`,
      salary: 'Thỏa thuận',
      status: 'MỚI',
      postedAt: 'Vừa xong',
    }));

    return { classes, profile };
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

    // Sử dụng Update nguyên tử (Atomic Update) để tránh Race Condition khi có 2 request đồng thời
    const updateResult = await this.classRequestRepository.update(
      { id: requestId, status: RequestStatus.PENDING },
      { status: RequestStatus.MATCHED }
    );

    const request = await this.classRequestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'student.user', 'subject'],
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu lớp học');
    if (updateResult.affected === 0) {
      throw new ForbiddenException('Lớp học này đã có người nhận hoặc không còn khả dụng');
    }

    const totalSessions = 20;
    const newClass = this.classRepository.create({
      tutor: { id: tutorId },
      student: request.student,
      subject: request.subject,
      request: request,
      location: request.preferredArea,
      feePerSession: request.budget || 250000,
      totalSessions,
      status: ClassStatus.ACTIVE,
      startDate: new Date(),
      notes: request.requirements,
    });

    const savedClass = await this.classRepository.save(newClass);

    // 3. Tự động tạo Schedule dựa trên preferredSchedule
    try {
      await this.generateSchedulesForClass(savedClass, request.preferredSchedule, totalSessions);
    } catch (err) {
      console.error('Error generating schedules for new class:', err);
    }

    // 4. Tạo thông báo cho học viên
    if (request.student?.user) {
      try {
        await this.notificationRepository.save({
          user: request.student.user,
          title: 'Lớp học đã có gia sư!',
          message: `Gia sư ${profile.fullName} đã nhận dạy lớp ${request.subject?.name || 'môn học của bạn'}.`,
        });
      } catch (err) {
        console.error('Error creating notification for student:', err);
      }
    }

    return savedClass;
  }

  /**
   * Parse preferredSchedule string và tạo Schedule entries cho lớp học.
   * Hỗ trợ các format:
   * - "Tối Thứ 2, Thứ 4 · 19:00 - 21:00"
   * - "Sáng Thứ 7, Chủ nhật · 08:00 - 10:00"
   * - "Tối T2, T4" (không có giờ cụ thể → dùng mặc định)
   * - "Linh hoạt" hoặc null → tạo 2 buổi/tuần mặc định
   */
  private async generateSchedulesForClass(classEntity: Class, preferredSchedule: string | null, totalSessions: number) {
    const dayMap: Record<string, number> = {
      'Thứ 2': 1, 'T2': 1,
      'Thứ 3': 2, 'T3': 2,
      'Thứ 4': 3, 'T4': 3,
      'Thứ 5': 4, 'T5': 4,
      'Thứ 6': 5, 'T6': 5,
      'Thứ 7': 6, 'T7': 6,
      'Chủ nhật': 0, 'CN': 0,
    };
    const dayLabelMap: Record<number, string> = {
      0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7',
    };

    let days: number[] = [];
    let startTime = '19:00:00';
    let endTime = '21:00:00';

    if (preferredSchedule && preferredSchedule !== 'Linh hoạt') {
      // Parse format "Tối Thứ 2, Thứ 4 · 19:00 - 21:00" hoặc "Tối T2, T4"
      const parts = preferredSchedule.split('·');
      const daysPart = parts[0].trim();

      // Trích xuất ngày
      for (const [key, value] of Object.entries(dayMap)) {
        if (daysPart.includes(key)) {
          if (!days.includes(value)) days.push(value);
        }
      }

      // Trích xuất giờ nếu có
      if (parts.length === 2) {
        const timePart = parts[1].trim();
        const timeParts = timePart.split('-').map(t => t.trim());
        if (timeParts.length === 2) {
          startTime = timeParts[0].length === 5 ? timeParts[0] + ':00' : timeParts[0];
          endTime = timeParts[1].length === 5 ? timeParts[1] + ':00' : timeParts[1];
        }
      } else {
        // Không có giờ → dùng mặc định theo buổi
        if (daysPart.includes('Sáng')) { startTime = '08:00:00'; endTime = '10:00:00'; }
        else if (daysPart.includes('Chiều')) { startTime = '14:00:00'; endTime = '16:00:00'; }
      }
    }

    // Fallback: nếu không parse được ngày, dùng T3 + T5 mặc định
    if (days.length === 0) {
      days = [2, 4]; // Thứ 3 và Thứ 5
    }

    // Tạo schedule cho 8 tuần tới (tối đa totalSessions buổi)
    const weeksToGenerate = Math.ceil(totalSessions / days.length);
    const maxWeeks = Math.min(weeksToGenerate, 12);
    const startDate = new Date();
    let sessionCount = 0;

    for (let week = 0; week < maxWeeks && sessionCount < totalSessions; week++) {
      for (const targetDay of days) {
        if (sessionCount >= totalSessions) break;

        // Tìm ngày gần nhất cho targetDay trong tuần hiện tại
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7);
        const currentDay = date.getDay();
        let diff = targetDay - currentDay;
        if (diff < 0 && week === 0) diff += 7;
        date.setDate(date.getDate() + diff);
        date.setHours(0, 0, 0, 0);

        // Chỉ tạo cho ngày tương lai
        if (date <= new Date()) continue;

        const schedule = this.scheduleRepository.create({
          class: classEntity,
          sessionDate: date,
          dayOfWeek: dayLabelMap[targetDay] || 'T2',
          startTime,
          endTime,
          sessionStatus: SessionStatus.SCHEDULED,
        });
        await this.scheduleRepository.save(schedule);
        sessionCount++;
      }
    }

    console.log(`Generated ${sessionCount} schedules for class ${classEntity.id}`);
  }

  async getNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async markAllNotificationsRead(userId: string) {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }

  async updateTutorProfile(userId: string, updateData: any) {
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!tutorEntity) throw new NotFoundException('Không tìm thấy gia sư');

    if (updateData.fullName !== undefined)
      tutorEntity.user.fullName = updateData.fullName;
    if (updateData.phone !== undefined)
      tutorEntity.user.phone = updateData.phone;
    if (updateData.address !== undefined)
      tutorEntity.user.address = updateData.address;
    if (updateData.avatarUrl !== undefined)
      tutorEntity.user.avatarUrl = updateData.avatarUrl;
    await this.userRepository.save(tutorEntity.user);

    if (updateData.experience !== undefined)
      tutorEntity.experience = updateData.experience;
    if (updateData.dob !== undefined)
      tutorEntity.dateOfBirth = updateData.dob
        ? new Date(updateData.dob)
        : (null as any);
    if (updateData.dateOfBirth !== undefined)
      tutorEntity.dateOfBirth = updateData.dateOfBirth
        ? new Date(updateData.dateOfBirth)
        : (null as any);
    if (updateData.educationLevel !== undefined)
      tutorEntity.educationLevel = updateData.educationLevel;
    if (updateData.major !== undefined) tutorEntity.major = updateData.major;
    if (updateData.availableAreas !== undefined)
      tutorEntity.availableAreas = updateData.availableAreas;
    if (updateData.bio !== undefined) tutorEntity.bio = updateData.bio;
    if (updateData.university !== undefined)
      tutorEntity.university = updateData.university;
    if (updateData.graduationYear !== undefined)
      tutorEntity.graduationYear = updateData.graduationYear;

    await this.tutorRepository.save(tutorEntity);

    // Nếu gửi kèm danh sách môn học thì cập nhật luôn môn học
    if (updateData.subjects && Array.isArray(updateData.subjects)) {
      await this.updateTutorSubjects(userId, updateData.subjects);
    }

    return {
      message: 'Cập nhật hồ sơ thành công',
      profile: await this.getTutorProfileData(userId),
    };
  }

  async getTutorSubjects(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy gia sư');

    const tutorSubjects = await this.tutorSubjectRepository.find({
      where: { tutor: { id: tutorEntity.id } },
      relations: ['subject'],
    });

    return tutorSubjects.map((ts) => ts.subject);
  }

  async updateTutorSubjects(userId: string, subjectNames: string[]) {
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy gia sư');

    // 1. Xóa các liên kết môn học cũ
    await this.tutorSubjectRepository.delete({ tutor: { id: tutorEntity.id } });

    // 2. Tạo các liên kết môn học mới
    for (const name of subjectNames) {
      if (!name) continue;
      const subject = await this.subjectRepository.findOne({ where: { name } });
      if (subject) {
        const ts = this.tutorSubjectRepository.create({
          tutor: tutorEntity,
          subject,
          proficiencyLevel: 'Co ban',
          yearsExperience: 2,
        });
        await this.tutorSubjectRepository.save(ts);
      }
    }
  }

  async createLeaveSchedule(
    userId: string,
    body: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      note: string;
    },
  ) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    // Parse the start and end of the holiday into UTC dates to avoid timezone shifts
    const [startYear, startMonth, startDay] = body.startDate
      .split('-')
      .map(Number);
    const [startH, startM] = body.startTime.split(':').map(Number);
    const leaveStart = new Date(
      Date.UTC(startYear, startMonth - 1, startDay, startH, startM, 0, 0),
    );

    const [endYear, endMonth, endDay] = body.endDate.split('-').map(Number);
    const [endH, endM] = body.endTime.split(':').map(Number);
    const leaveEnd = new Date(
      Date.UTC(endYear, endMonth - 1, endDay, endH, endM, 0, 0),
    );

    // Fetch schedules spanning the entire date range
    const startRange = new Date(body.startDate);
    startRange.setHours(0, 0, 0, 0);
    const endRange = new Date(body.endDate);
    endRange.setHours(23, 59, 59, 999);

    const schedules = await this.scheduleRepository.find({
      where: {
        class: { tutor: { id: tutorId } },
        sessionDate: Between(startRange, endRange),
        sessionStatus: SessionStatus.SCHEDULED,
      },
    });

    let cancelledCount = 0;
    for (const schedule of schedules) {
      // Get the correct date components for sessionDate without local timezone shifting
      const sDateObj =
        schedule.sessionDate instanceof Date
          ? schedule.sessionDate
          : new Date(schedule.sessionDate);
      const dateStr = sDateObj.toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);

      const [sh, sm] = schedule.startTime.split(':').map(Number);
      const [eh, em] = schedule.endTime.split(':').map(Number);

      const sStart = new Date(Date.UTC(year, month - 1, day, sh, sm, 0, 0));
      const sEnd = new Date(Date.UTC(year, month - 1, day, eh, em, 0, 0));

      // Overlap: sStart < leaveEnd AND sEnd > leaveStart
      if (sStart < leaveEnd && sEnd > leaveStart) {
        schedule.sessionStatus = SessionStatus.CANCELLED;
        schedule.note = body.note;
        await this.scheduleRepository.save(schedule);
        cancelledCount++;
      }
    }

    return {
      message:
        cancelledCount > 0
          ? `Đã hủy ${cancelledCount} buổi học thành công`
          : 'Đăng ký nghỉ thành công (không có buổi học nào trong khung giờ này)',
      cancelledCount,
    };
  }

  async cancelLeaveSchedule(userId: string, scheduleId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, class: { tutor: { id: tutorId } } },
    });

    if (!schedule) {
      throw new NotFoundException(
        'Không tìm thấy buổi học hoặc buổi học không thuộc quản lý của bạn.',
      );
    }

    if (schedule.sessionStatus !== SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Buổi học này không ở trạng thái nghỉ học.',
      );
    }

    schedule.sessionStatus = SessionStatus.SCHEDULED;
    schedule.note = null as any; // Clear the leave note
    await this.scheduleRepository.save(schedule);

    return {
      message: 'Đã hủy lịch nghỉ và khôi phục buổi học thành công.',
      schedule,
    };
  }

  async cancelLeaveScheduleRange(
    userId: string,
    data: { startDate: string; endDate: string },
  ) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(data.endDate);
    end.setHours(23, 59, 59, 999);

    const schedules = await this.scheduleRepository.find({
      where: {
        class: { tutor: { id: tutorId } },
        sessionDate: Between(start, end),
        sessionStatus: SessionStatus.CANCELLED,
      },
    });

    if (schedules.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy lịch nghỉ nào trong khoảng thời gian này.',
      );
    }

    for (const schedule of schedules) {
      schedule.sessionStatus = SessionStatus.SCHEDULED;
      schedule.note = null as any;
    }

    await this.scheduleRepository.save(schedules);

    return {
      message: `Đã hủy thành công ${schedules.length} lịch nghỉ trong khoảng thời gian đã chọn.`,
      schedules,
    };
  }

  async getReportsByClass(classId: string, userId: string) {
    try {
      const profile = await this.getTutorProfileData(userId);
      const tutorId = profile.id;

      return this.learningReportRepository.find({
        where: { class: { id: classId }, tutor: { id: tutorId } },
        order: { reportDate: 'DESC' },
      });
    } catch (err) {
      // Nếu không tìm thấy hồ sơ gia sư (ví dụ: Staff/Admin gọi),
      // trả về toàn bộ báo cáo của lớp học đó (kèm thông tin gia sư).
      return this.learningReportRepository.find({
        where: { class: { id: classId } },
        relations: ['tutor', 'tutor.user'],
        order: { reportDate: 'DESC' },
      });
    }
  }

  async createReport(userId: string, dto: CreateLearningReportDto) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const classInstance = await this.classRepository.findOne({
      where: { id: dto.classId },
      relations: ['tutor'],
    });

    if (!classInstance)
      throw new NotFoundException(
        `Không tìm thấy lớp học với ID ${dto.classId}`,
      );
    if (classInstance.tutor.id !== tutorId)
      throw new ForbiddenException('Bạn không có quyền nộp báo cáo.');

    // Kiểm tra số buổi học thực tế (không tính lịch nghỉ) đến hiện tại
    const maxAllowedReports = await this.scheduleRepository.count({
      where: {
        class: { id: dto.classId },
        sessionDate: LessThanOrEqual(new Date()),
        sessionStatus: In([
          SessionStatus.SCHEDULED,
          SessionStatus.COMPLETED,
          SessionStatus.RESCHEDULED,
        ]),
      },
    });

    const currentReportsCount = await this.learningReportRepository.count({
      where: { class: { id: dto.classId } },
    });

    if (currentReportsCount >= maxAllowedReports) {
      throw new BadRequestException(
        `Không thể nộp báo cáo. Số lượng báo cáo (${currentReportsCount}) đã đạt giới hạn tối đa theo số buổi học thực tế đến hôm nay (${maxAllowedReports}).`,
      );
    }

    const { classId, ...reportData } = dto;

    const newReport = this.learningReportRepository.create({
      ...reportData,
      class: { id: classId },
      tutor: { id: tutorId },
      reportDate: new Date(),
    });

    const savedReport = await this.learningReportRepository.save(newReport);

    // Auto-update the oldest SCHEDULED schedule of this class to COMPLETED
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if there is a scheduled session today
      let schedule = await this.scheduleRepository.findOne({
        where: {
          class: { id: classId },
          sessionDate: today,
          sessionStatus: SessionStatus.SCHEDULED,
        },
      });

      // If not, find the oldest scheduled session that is in the past or today
      if (!schedule) {
        schedule = await this.scheduleRepository.findOne({
          where: {
            class: { id: classId },
            sessionDate: LessThanOrEqual(new Date()),
            sessionStatus: SessionStatus.SCHEDULED,
          },
          order: { sessionDate: 'ASC', startTime: 'ASC' },
        });
      }

      if (schedule) {
        schedule.sessionStatus = SessionStatus.COMPLETED;
        await this.scheduleRepository.save(schedule);
      }
    } catch (err) {
      console.error('Error auto-completing schedule on report submit:', err);
    }

    return savedReport;
  }

  async updateReport(
    reportId: string,
    userId: string,
    dto: Partial<CreateLearningReportDto>,
  ) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const report = await this.learningReportRepository.findOne({
      where: { id: reportId, tutor: { id: tutorId } },
    });
    if (!report) throw new NotFoundException('Không tìm thấy báo cáo');

    Object.assign(report, dto);
    return this.learningReportRepository.save(report);
  }

  async deleteReport(reportId: string, userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const report = await this.learningReportRepository.findOne({
      where: { id: reportId, tutor: { id: tutorId } },
      relations: ['class'],
    });

    if (!report) throw new NotFoundException('Không tìm thấy báo cáo để xóa');

    const classId = report.class?.id;

    await this.learningReportRepository.delete(reportId);

    // Revert the latest COMPLETED schedule of this class back to SCHEDULED
    if (classId) {
      try {
        const schedule = await this.scheduleRepository.findOne({
          where: {
            class: { id: classId },
            sessionStatus: SessionStatus.COMPLETED,
          },
          order: { sessionDate: 'DESC', startTime: 'DESC' },
        });

        if (schedule) {
          schedule.sessionStatus = SessionStatus.SCHEDULED;
          await this.scheduleRepository.save(schedule);
        }
      } catch (err) {
        console.error('Error auto-reverting schedule on report delete:', err);
      }
    }

    return { message: 'Xóa báo cáo thành công' };
  }

  /** Seed completed schedules cho các tutor có sẵn để test tính năng earnings */
  private async seedEarningsTestData() {
    try {
      // Kiểm tra đã có completed schedules chưa (nếu có rồi thì skip)
      const existingCompleted = await this.scheduleRepository.count({
        where: { sessionStatus: SessionStatus.COMPLETED },
      });
      if (existingCompleted > 0) {
        console.log(
          '--- Completed schedules already exist. Skipping earnings seed. ---',
        );
        return;
      }

      console.log(
        '--- Seeding completed schedules for earnings testing... ---',
      );
      const scheduleRepo = this.scheduleRepository;
      const now = new Date();
      const mathSubject = await this.subjectRepository.findOne({
        where: { name: 'Toán học' },
      });

      // Helper: tạo completed schedule
      const createCompleted = async (
        classEntity: Class,
        daysAgo: number,
        startTime: string,
        endTime: string,
        note: string,
      ) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(0, 0, 0, 0);

        // Check trùng lịch
        const existing = await scheduleRepo.findOneBy({
          class: { id: classEntity.id },
          sessionDate: date,
        });
        if (existing) return existing;

        return scheduleRepo.save(
          scheduleRepo.create({
            class: classEntity,
            sessionDate: date,
            dayOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][
              date.getDay()
            ],
            startTime,
            endTime,
            sessionStatus: SessionStatus.COMPLETED,
            note,
          }),
        );
      };

      // ========== TUTOR CÂM (tran_thi_cam@tutoredu.com) ==========
      const tutorCam = await this.tutorRepository.findOne({
        where: { user: { email: 'tran_thi_cam@tutoredu.com' } },
      });

      if (tutorCam) {
        // Class 1: Duyen - Hóa học - 300k/buổi
        const studentDuyen = await this.studentRepository.findOne({
          where: { user: { email: 'tran_my_duyen@tutoredu.com' } },
        });
        const chemSubject = await this.subjectRepository.findOne({
          where: { name: 'Hóa học' },
        });

        if (studentDuyen && chemSubject) {
          let classDuyen = await this.classRepository.findOne({
            where: {
              tutor: { id: tutorCam.id },
              student: { id: studentDuyen.id },
            },
            relations: ['subject', 'student', 'student.user'],
          });
          if (!classDuyen) {
            classDuyen = await this.classRepository.save(
              this.classRepository.create({
                tutor: tutorCam,
                student: studentDuyen,
                subject: chemSubject,
                feePerSession: 300000,
                totalSessions: 20,
                status: ClassStatus.ACTIVE,
                startDate: new Date('2026-05-01'),
                location: 'Quận 7, TP.HCM',
              }),
            );
          }

          // 3 completed schedules cho class Duyen
          await createCompleted(
            classDuyen,
            14,
            '19:00:00',
            '21:00:00',
            'Phản ứng oxy hóa khử',
          );
          await createCompleted(
            classDuyen,
            12,
            '19:00:00',
            '21:00:00',
            'Cân bằng phương trình hóa học',
          );
          await createCompleted(
            classDuyen,
            7,
            '19:00:00',
            '21:00:00',
            'Bài tập về nồng độ dung dịch',
          );
        }

        // Class 2: Ha - Toán học - 250k/buổi
        const studentHa = await this.studentRepository.findOne({
          where: { user: { email: 'nguyen_thi_ha@tutoredu.com' } },
        });

        if (studentHa && mathSubject) {
          let classHa = await this.classRepository.findOne({
            where: {
              tutor: { id: tutorCam.id },
              student: { id: studentHa.id },
            },
          });
          if (!classHa) {
            classHa = await this.classRepository.save(
              this.classRepository.create({
                tutor: tutorCam,
                student: studentHa,
                subject: mathSubject,
                feePerSession: 250000,
                totalSessions: 15,
                status: ClassStatus.ACTIVE,
                startDate: new Date('2026-06-01'),
                location: 'Quận 7, TP.HCM',
              }),
            );
          }

          // 2 completed schedules cho class Ha
          await createCompleted(
            classHa,
            10,
            '17:00:00',
            '19:00:00',
            'Ôn tập chương 1 - Hàm số',
          );
          await createCompleted(
            classHa,
            8,
            '17:00:00',
            '19:00:00',
            'Giải bài tập chương 1',
          );
        }
      }

      // ========== TUTOR BÌNH (nguyen_van_binh@tutoredu.com) ==========
      // Class with Tan - Toán học - 250k/buổi (5 completed)
      const tutorBinh = await this.tutorRepository.findOne({
        where: { user: { email: 'nguyen_van_binh@tutoredu.com' } },
      });
      const studentTan = await this.studentRepository.findOne({
        where: { user: { email: 'le_trong_tan@tutoredu.com' } },
      });

      if (tutorBinh && studentTan && mathSubject) {
        let classTan = await this.classRepository.findOne({
          where: {
            tutor: { id: tutorBinh.id },
            student: { id: studentTan.id },
          },
        });
        if (!classTan) {
          classTan = await this.classRepository.save(
            this.classRepository.create({
              tutor: tutorBinh,
              student: studentTan,
              subject: mathSubject,
              feePerSession: 250000,
              totalSessions: 10,
              status: ClassStatus.COMPLETED,
              startDate: new Date('2026-04-01'),
              endDate: new Date('2026-05-01'),
              location: 'Quận 1, TP.HCM',
            }),
          );
        }

        // 5 completed schedules cho class Tan
        await createCompleted(
          classTan,
          30,
          '19:00:00',
          '21:00:00',
          'Hàm số bậc nhất',
        );
        await createCompleted(
          classTan,
          28,
          '19:00:00',
          '21:00:00',
          'Hàm số bậc hai',
        );
        await createCompleted(
          classTan,
          26,
          '19:00:00',
          '21:00:00',
          'Phương trình & hệ phương trình',
        );
        await createCompleted(
          classTan,
          24,
          '19:00:00',
          '21:00:00',
          'Bất phương trình',
        );
        await createCompleted(
          classTan,
          22,
          '19:00:00',
          '21:00:00',
          'Ôn tập giữa kỳ',
        );
      }

      // ========== TUTOR TEST (tutor@test.com - 123456) ==========
      // Tìm class của tutor test và mark schedule là completed
      const tutorTest = await this.tutorRepository.findOne({
        where: { user: { email: 'tutor@test.com' } },
      });
      if (tutorTest) {
        const testClass = await this.classRepository.findOne({
          where: { tutor: { id: tutorTest.id } },
          relations: ['subject', 'student', 'student.user'],
        });
        if (testClass && !testClass.feePerSession) {
          testClass.feePerSession = 200000;
          await this.classRepository.save(testClass);
        }

        // Tạo completed schedule hôm qua
        if (testClass) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          const pastSchedule = await scheduleRepo.findOne({
            where: {
              class: { id: testClass.id },
              sessionDate: yesterday,
            },
          });

          if (!pastSchedule) {
            await scheduleRepo.save(
              scheduleRepo.create({
                class: testClass,
                sessionDate: yesterday,
                dayOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][
                  yesterday.getDay()
                ],
                startTime: '19:00:00',
                endTime: '21:00:00',
                sessionStatus: SessionStatus.COMPLETED,
                note: 'Buổi học đầu tiên - Làm quen',
              }),
            );
          }
        }
      }

      // (Class Duyen completed schedules đã được tạo ở phần Tutor Câm bên trên)

      console.log('--- Earnings test data seeded successfully! ---');
    } catch (err) {
      console.error('Error seeding earnings test data:', err);
    }
  }

  async getTutorEarnings(userId: string) {
    // Tìm tutor entity trực tiếp thay vì dùng getTutorProfileData (tránh lỗi nested relations)
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity)
      throw new NotFoundException('Không tìm thấy hồ sơ gia sư');
    const tutorId = tutorEntity.id;

    // Lấy raw data thay vì toàn bộ Nested Entity Objects vào RAM để tránh Memory Leak
    const rawSchedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoin('schedule.class', 'class')
      .leftJoin('class.subject', 'subject')
      .leftJoin('class.student', 'student')
      .leftJoin('student.user', 'user')
      .where('class.tutor = :tutorId', { tutorId })
      .andWhere('schedule.sessionDate <= :today', { today: new Date() })
      .andWhere('schedule.sessionStatus != :cancelledStatus', { cancelledStatus: SessionStatus.CANCELLED })
      .select([
        'schedule.session_date AS "sessionDate"',
        'class.id AS "classId"',
        'class.fee_per_session AS "feePerSession"',
        'subject.name AS "subject"',
        'user.full_name AS "studentName"',
      ])
      .orderBy('schedule.sessionDate', 'DESC')
      .getRawMany();

    // Tính tổng thu nhập
    let totalEarnings = 0;
    const classEarningsMap = new Map<
      string,
      {
        classId: string;
        subject: string;
        studentName: string;
        feePerSession: number;
        sessions: number;
        totalEarnings: number;
      }
    >();

    for (const s of rawSchedules) {
      const fee = Number(s.feePerSession || 0);
      totalEarnings += fee;

      const classId = s.classId || 'unknown';
      if (!classEarningsMap.has(classId)) {
        classEarningsMap.set(classId, {
          classId,
          subject: s.subject || 'Chưa rõ',
          studentName: s.studentName || 'Chưa rõ',
          feePerSession: fee,
          sessions: 0,
          totalEarnings: 0,
        });
      }
      const entry = classEarningsMap.get(classId)!;
      entry.sessions += 1;
      entry.totalEarnings += fee;
    }

    // Tính thu nhập theo tháng
    const monthlyMap = new Map<string, number>();
    for (const s of rawSchedules) {
      const date =
        s.sessionDate instanceof Date ? s.sessionDate : new Date(s.sessionDate);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const fee = Number(s.feePerSession || 0);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + fee);
    }

    const monthlyEarnings = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const [mA, yA] = a.month.split('/').map(Number);
        const [mB, yB] = b.month.split('/').map(Number);
        return yB - yA || mB - mA;
      });

    // Thống kê tháng hiện tại
    const now = new Date();
    const currentMonthKey = `${now.getMonth() + 1}/${now.getFullYear()}`;
    const currentMonthEarnings = monthlyMap.get(currentMonthKey) || 0;

    // Số buổi đã dạy
    const totalSessions = rawSchedules.length;

    return {
      totalEarnings,
      totalSessions,
      currentMonthEarnings,
      averagePerSession:
        totalSessions > 0 ? Math.round(totalEarnings / totalSessions) : 0,
      byClass: Array.from(classEarningsMap.values()).sort(
        (a, b) => b.totalEarnings - a.totalEarnings,
      ),
      monthly: monthlyEarnings,
    };
  }

  async seedMockData() {
    const TEST_TUTOR_ID = '00000000-0000-0000-0003-000000000001';

    // 1. Tạo hoặc lấy Role mẫu
    let tutorRole = await this.roleRepository.findOne({
      where: { name: 'tutor' },
    });
    if (!tutorRole) {
      tutorRole = await this.roleRepository.save(
        this.roleRepository.create({ name: 'tutor' }),
      );
    }

    let studentRole = await this.roleRepository.findOne({
      where: { name: 'student' },
    });
    if (!studentRole) {
      studentRole = await this.roleRepository.save(
        this.roleRepository.create({ name: 'student' }),
      );
    }

    // 2. Tạo hoặc lấy User & Tutor/Student mẫu
    let tutorUser = await this.userRepository.findOne({
      where: { email: 'tutor@test.com' },
    });
    if (!tutorUser) {
      tutorUser = await this.userRepository.save(
        this.userRepository.create({
          id: TEST_TUTOR_ID,
          fullName: 'Gia sư Mẫu',
          email: 'tutor@test.com',
          passwordHash: '123456',
          role: tutorRole,
        }),
      );
    }
    let tutor = await this.tutorRepository.findOne({
      where: { user: { id: tutorUser.id } },
    });
    if (!tutor) {
      tutor = await this.tutorRepository.save(
        this.tutorRepository.create({ user: tutorUser }),
      );
    }

    let studentUser = await this.userRepository.findOne({
      where: { email: 'student@test.com' },
    });
    if (!studentUser) {
      studentUser = await this.userRepository.save(
        this.userRepository.create({
          fullName: 'Học viên Mẫu',
          email: 'student@test.com',
          passwordHash: '123456',
          role: studentRole,
        }),
      );
    }
    let student = await this.studentRepository.findOne({
      where: { user: { id: studentUser.id } },
    });
    if (!student) {
      student = await this.studentRepository.save(
        this.studentRepository.create({
          user: studentUser,
          gradeLevel: 'Lớp 12',
        }),
      );
    }

    // 3. Tạo hoặc lấy Subject
    let math = await this.subjectRepository.findOne({
      where: { name: 'Toán học' },
    });
    if (!math) {
      math = await this.subjectRepository.save(
        this.subjectRepository.create({ name: 'Toán học' }),
      );
    }

    let english = await this.subjectRepository.findOne({
      where: { name: 'Tiếng Anh' },
    });
    if (!english) {
      english = await this.subjectRepository.save(
        this.subjectRepository.create({ name: 'Tiếng Anh' }),
      );
    }

    // 4. Tạo Class & Schedule
    const existingClass = await this.classRepository.count({
      where: { tutor: { id: tutor.id } },
    });
    if (existingClass === 0) {
      const cls = await this.classRepository.save(
        this.classRepository.create({
          tutor,
          student,
          subject: math,
          status: ClassStatus.ACTIVE,
          feePerSession: 200000,
          totalSessions: 20,
        }),
      );

      const today = new Date();
      await this.scheduleRepository.save(
        this.scheduleRepository.create({
          class: cls,
          sessionDate: today,
          startTime: '19:00',
          endTime: '21:00',
          dayOfWeek: 'Today',
        }),
      );

      // Tạo Class Requests (New Classes)
      await this.classRequestRepository.save([
        this.classRequestRepository.create({
          student,
          subject: math,
          preferredArea: 'Quận 1, TP.HCM',
          preferredSchedule: 'Tối T2, T4',
          status: RequestStatus.PENDING,
        }),
        this.classRequestRepository.create({
          student,
          subject: english,
          preferredArea: 'Online',
          preferredSchedule: 'Sáng CN',
          status: RequestStatus.PENDING,
        }),
        this.classRequestRepository.create({
          student,
          subject: math,
          preferredArea: 'Quận 7, TP.HCM',
          preferredSchedule: 'Chiều T7, CN',
          requirements: 'Cần gia sư dạy nâng cao toán hình lớp 11.',
          status: RequestStatus.PENDING,
        }),
        this.classRequestRepository.create({
          student,
          subject: english,
          preferredArea: 'Quận Bình Thạnh, TP.HCM',
          preferredSchedule: 'Tối T3, T5',
          requirements: 'Gia sư luyện thi IELTS, mục tiêu 6.5.',
          status: RequestStatus.PENDING,
        }),
      ]);
    }

    return { message: 'Mock data seeded' };
  }

  async getTutorPendingProposals(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    const requests = await this.classRequestRepository.find({
      where: {
        preferredTutor: { id: tutorEntity.id },
        status: In([RequestStatus.PROPOSED, RequestStatus.NEGOTIATING]),
      },
      relations: {
        student: { user: true },
        subject: true,
        preferredTutor: { user: true },
      },
      order: { proposedAt: 'DESC' },
    });

    return requests.map((req) => ({
      id: req.id,
      studentName: req.student?.user?.fullName || 'Ẩn danh',
      studentEmail: req.student?.user?.email || '',
      gradeLevel: req.student?.gradeLevel || '',
      subject: req.subject?.name || 'Môn học',
      preferredArea: req.preferredArea || 'Toàn quốc',
      preferredSchedule: req.preferredSchedule || 'Linh hoạt',
      requirements: req.requirements || '',
      proposedFee: Number(req.proposedFee) || 0,
      proposedSessions: req.proposedSessions || 0,
      totalFee: (Number(req.proposedFee) || 0) * (req.proposedSessions || 0),
      status: req.status,
      proposedAt: req.proposedAt,
      createdAt: req.createdAt,
    }));
  }

  async getTutorRecommendations(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    const requests = await this.classRequestRepository.find({
      where: {
        preferredTutor: { id: tutorEntity.id },
        status: RequestStatus.PENDING,
      },
      relations: {
        student: { user: true },
        subject: true,
        preferredTutor: { user: true },
      },
      order: { createdAt: 'DESC' },
    });

    return requests.map((req) => ({
      id: req.id,
      studentName: req.student?.user?.fullName || 'Ẩn danh',
      studentEmail: req.student?.user?.email || '',
      studentPhone: req.student?.user?.phone || '',
      gradeLevel: req.student?.gradeLevel || '',
      subject: req.subject?.name || 'Môn học',
      preferredArea: req.preferredArea || 'Toàn quốc',
      preferredSchedule: req.preferredSchedule || 'Linh hoạt',
      requirements: req.requirements || '',
      createdAt: req.createdAt,
      status: req.status,
    }));
  }

  async proposeRecommendation(
    requestId: string,
    userId: string,
    feePerSession: number,
    totalSessions: number,
  ) {
    const request = await this.classRequestRepository.findOne({
      where: { id: requestId },
      relations: {
        student: true,
        subject: true,
        preferredTutor: { user: true },
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này không còn khả dụng');
    }

    // Verify this tutor is the preferred one
    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    if (!request.preferredTutor || request.preferredTutor.id !== tutorEntity.id) {
      throw new BadRequestException('Bạn không phải là gia sư được đề xuất trong yêu cầu này');
    }

    // Validate fee and sessions
    if (!feePerSession || feePerSession < 50000) {
      throw new BadRequestException('Học phí tối thiểu là 50.000đ/buổi');
    }
    if (!totalSessions || totalSessions < 1) {
      throw new BadRequestException('Số buổi học tối thiểu là 1');
    }

    // Save proposal
    request.proposedFee = feePerSession;
    request.proposedSessions = totalSessions;
    request.proposedAt = new Date();
    request.status = RequestStatus.PROPOSED;
    await this.classRequestRepository.save(request);

    return {
      message: `Bạn đã gửi đề xuất: ${feePerSession.toLocaleString('vi-VN')}đ/buổi, ${totalSessions} buổi. Đang chờ học viên xác nhận.`,
      proposal: {
        feePerSession,
        totalSessions,
        totalFee: feePerSession * totalSessions,
      },
    };
  }

  async modifyProposal(
    requestId: string,
    userId: string,
    feePerSession: number,
    totalSessions: number,
  ) {
    const request = await this.classRequestRepository.findOne({
      where: { id: requestId },
      relations: {
        preferredTutor: { user: true },
      },
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (
      request.status !== RequestStatus.PROPOSED &&
      request.status !== RequestStatus.NEGOTIATING
    ) {
      throw new BadRequestException('Yêu cầu này không thể sửa đề xuất');
    }

    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');
    if (!request.preferredTutor || request.preferredTutor.id !== tutorEntity.id) {
      throw new BadRequestException('Bạn không phải là gia sư được đề xuất');
    }

    if (!feePerSession || feePerSession < 50000) {
      throw new BadRequestException('Học phí tối thiểu là 50.000đ/buổi');
    }
    if (!totalSessions || totalSessions < 1) {
      throw new BadRequestException('Số buổi học tối thiểu là 1');
    }

    request.proposedFee = feePerSession;
    request.proposedSessions = totalSessions;
    request.proposedAt = new Date();
    request.status = RequestStatus.PROPOSED;
    request.requirements = [
      request.requirements || '',
      `[Gia sư đã cập nhật đề xuất: ${feePerSession.toLocaleString('vi-VN')}đ/buổi, ${totalSessions} buổi]`,
    ]
      .filter(Boolean)
      .join('\n');
    await this.classRequestRepository.save(request);

    return {
      message: `Đã cập nhật đề xuất: ${feePerSession.toLocaleString('vi-VN')}đ/buổi, ${totalSessions} buổi.`,
    };
  }

  async withdrawProposal(requestId: string, userId: string) {
    const request = await this.classRequestRepository.findOne({
      where: { id: requestId },
      relations: {
        preferredTutor: { user: true },
      },
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (
      request.status !== RequestStatus.PROPOSED &&
      request.status !== RequestStatus.NEGOTIATING
    ) {
      throw new BadRequestException('Yêu cầu này không thể rút đề xuất');
    }

    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');
    if (!request.preferredTutor || request.preferredTutor.id !== tutorEntity.id) {
      throw new BadRequestException('Bạn không phải là gia sư được đề xuất');
    }

    request.preferredTutor = null as any;
    request.status = RequestStatus.PENDING;
    request.proposedFee = null as any;
    request.proposedSessions = null as any;
    request.proposedAt = null as any;
    request.requirements = [
      request.requirements || '',
      `[Gia sư ${tutorEntity.user?.fullName || ''} đã rút đề xuất.]`,
    ]
      .filter(Boolean)
      .join('\n');
    await this.classRequestRepository.save(request);

    return {
      message: 'Bạn đã rút đề xuất. Yêu cầu mở lại cho tất cả gia sư.',
    };
  }

  async declineRecommendation(requestId: string, userId: string) {
    const request = await this.classRequestRepository.findOne({
      where: { id: requestId },
      relations: {
        preferredTutor: { user: true },
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này không còn khả dụng');
    }

    const tutorEntity = await this.tutorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    if (!request.preferredTutor || request.preferredTutor.id !== tutorEntity.id) {
      throw new BadRequestException('Bạn không phải là gia sư được đề xuất trong yêu cầu này');
    }

    // Remove preferredTutor so other tutors can take the request
    request.preferredTutor = null as any;
    const oldTutorName = tutorEntity.user?.fullName || 'Gia sư';
    request.requirements = [
      request.requirements || '',
      `[Gia sư ${oldTutorName} đã từ chối đề xuất. Yêu cầu được mở lại cho tất cả gia sư.]`,
    ]
      .filter(Boolean)
      .join('\n');

    await this.classRequestRepository.save(request);

    return {
      message: 'Bạn đã từ chối đề xuất từ học viên. Yêu cầu sẽ được mở lại cho tất cả gia sư.',
    };
  }

  async getPublicTutors(params: {
    search?: string;
    subject?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', subject = '', page = 1, limit = 12 } = params;

    const qb = this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.user', 'user')
      .where('tutor.approvalStatus = :status', {
        status: ApprovalStatus.APPROVED,
      });

    if (search) {
      qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (subject) {
      const subjectNames = subject.split(',');
      const subQuery = this.tutorSubjectRepository
        .createQueryBuilder('ts')
        .select('ts.tutor_id')
        .innerJoin('ts.subject', 's')
        .where('s.name IN (:...subjectNames)', { subjectNames })
        .getQuery();
      qb.andWhere(`tutor.id IN (${subQuery})`, { subjectNames });
    }

    qb.orderBy('user.fullName', 'ASC');

    const [tutors, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Lấy danh sách môn học cho tất cả gia sư trong 1 query (tránh N+1)
    const tutorIds = tutors.map((t) => t.id);
    const allTutorSubjects =
      tutorIds.length > 0
        ? await this.tutorSubjectRepository.find({
            where: { tutor: { id: In(tutorIds) } },
            relations: ['subject'],
          })
        : [];
    const subjectMap = new Map<string, string[]>();
    for (const ts of allTutorSubjects) {
      const list = subjectMap.get(ts.tutor.id) || [];
      if (ts.subject?.name) list.push(ts.subject.name);
      subjectMap.set(ts.tutor.id, list);
    }

    // Lấy rating, review count và average price cho tất cả tutor trong 1 query mỗi loại
    const reviewStatsMap = new Map<
      string,
      { avgRating: number; reviewCount: number }
    >();
    if (tutorIds.length > 0) {
      const reviewStats = await this.reviewRepository
        .createQueryBuilder('r')
        .select('r.tutor_id', 'tutorId')
        .addSelect('AVG(r.rating)', 'avgRating')
        .addSelect('COUNT(r.id)', 'reviewCount')
        .where('r.tutor_id IN (:...tutorIds)', { tutorIds })
        .groupBy('r.tutor_id')
        .getRawMany();

      for (const rs of reviewStats) {
        reviewStatsMap.set(rs.tutorId, {
          avgRating: Number(rs.avgRating) || 0,
          reviewCount: Number(rs.reviewCount) || 0,
        });
      }
    }

    // Lấy average feePerSession từ classes
    const priceMap = new Map<string, number>();
    if (tutorIds.length > 0) {
      const priceStats = await this.classRepository
        .createQueryBuilder('c')
        .select('c.tutor_id', 'tutorId')
        .addSelect('AVG(c.fee_per_session)', 'avgPrice')
        .where('c.tutor_id IN (:...tutorIds)', { tutorIds })
        .andWhere('c.fee_per_session IS NOT NULL')
        .groupBy('c.tutor_id')
        .getRawMany();

      for (const ps of priceStats) {
        priceMap.set(ps.tutorId, Number(ps.avgPrice) || 0);
      }
    }

    const data = tutors.map((tutor) => {
      const reviewStat = reviewStatsMap.get(tutor.id);
      const avgPrice = priceMap.get(tutor.id) || 200000;

      return {
        id: tutor.id,
        fullName: tutor.user?.fullName || '',
        email: tutor.user?.email || '',
        phone: tutor.user?.phone || '',
        address: tutor.user?.address || '',
        avatarUrl: tutor.user?.avatarUrl || '',
        bio: tutor.bio || '',
        educationLevel: tutor.educationLevel || '',
        major: tutor.major || '',
        experience: tutor.experience || '',
        availableAreas: tutor.availableAreas || '',
        subjects: subjectMap.get(tutor.id) || [],
        rating: reviewStat?.avgRating || 0,
        reviews: reviewStat?.reviewCount || 0,
        price: avgPrice,
      };
    });

    return {
      data,
      meta: { total, page, limit },
    };
  }
}
