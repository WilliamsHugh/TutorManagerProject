import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

// Entities
import { Class, ClassStatus } from '../classes/entities/class.entity';
import { Schedule, SessionStatus } from '../classes/entities/schedule.entity';
import { LearningReport } from '../classes/entities/learning-report.entity';
import { ClassRequest, RequestStatus } from '../classes/entities/class-request.entity';
import { User } from '../users/entities/user.entity';
import { Tutor, ApprovalStatus } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { Role } from '../users/entities/role.entity';
import { Notification } from '../notifications/notification.entity';
import { TutorSubject } from './tutor-subject.entity';
import { CreateLearningReportDto } from '../reports/dto/create-report.dto';

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
  ) {}

  async onModuleInit() {
    // Tự động gộp và dọn dẹp các môn học cũ (Toán -> Toán học, Lý -> Vật lí, Hóa -> Hóa học)
    const mergeSubject = async (oldName: string, newName: string) => {
      // Tìm tất cả các môn học cũ (bao gồm cả trường hợp có nhiều môn trùng tên do lỗi dữ liệu)
      const oldSubs = await this.subjectRepository.find({ where: { name: oldName } });
      if (oldSubs.length === 0) return;

      const newSub = await this.subjectRepository.findOne({ where: { name: newName } });
      if (newSub) {
        for (const oldSub of oldSubs) {
          if (oldSub.id === newSub.id) continue;

          // 1. Gộp liên kết trong TutorSubject sang môn mới
          const tsList = await this.tutorSubjectRepository.find({ where: { subject: { id: oldSub.id } } });
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
          const classList = await this.classRepository.find({ where: { subject: { id: oldSub.id } } });
          for (const cls of classList) {
            cls.subject = newSub;
            await this.classRepository.save(cls);
          }

          // 3. Gộp liên kết trong ClassRequest sang môn mới
          const reqList = await this.classRequestRepository.find({ where: { subject: { id: oldSub.id } } });
          for (const req of reqList) {
            req.subject = newSub;
            await this.classRequestRepository.save(req);
          }

          // 4. Xóa môn học cũ
          try {
            await this.subjectRepository.delete(oldSub.id);
            console.log(`Merged duplicate subject '${oldName}' into '${newName}' and deleted the old one.`);
          } catch (deleteError) {
            console.error(`Failed to delete old subject '${oldName}':`, deleteError);
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
            
            const tsList = await this.tutorSubjectRepository.find({ where: { subject: { id: oldSub.id } } });
            for (const ts of tsList) {
              ts.subject = firstOldSub;
              try {
                await this.tutorSubjectRepository.save(ts);
              } catch (err) {
                await this.tutorSubjectRepository.delete(ts.id);
              }
            }

            const classList = await this.classRepository.find({ where: { subject: { id: oldSub.id } } });
            for (const cls of classList) {
              cls.subject = firstOldSub;
              await this.classRepository.save(cls);
            }

            const reqList = await this.classRequestRepository.find({ where: { subject: { id: oldSub.id } } });
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
    const studentExists = await this.userRepository.findOne({ where: { email: 'student@test.com' } });
    if (!studentExists) {
      console.log('--- Student user not found. Seeding mock tutor and student accounts into database... ---');
      await this.seedMockData();
    }
  }

  // Hàm dùng chung để lấy thông tin profile cho Header các trang
  async getTutorProfileData(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { user: { id: userId } },
      relations: ['user', 'user.role']
    });
    
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy hồ sơ gia sư');

    // Lấy danh sách môn học của gia sư
    const tutorSubjects = await this.tutorSubjectRepository.find({
      where: { tutor: { id: tutorEntity.id } },
      relations: ['subject']
    });
    const subjects = tutorSubjects.map(ts => ts.subject?.name).filter(Boolean);

    return {
      id: tutorEntity.id,
      fullName: tutorEntity.user?.fullName || 'Gia sư',
      roleName: tutorEntity.user?.role?.name === 'tutor' ? 'Gia sư hệ thống' : tutorEntity.user?.role?.name || 'Người dùng',
      avatar: tutorEntity.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1", 
      avatarUrl: tutorEntity.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1", 
      email: tutorEntity.user?.email,
      phone: tutorEntity.user?.phone,
      address: tutorEntity.user?.address,
      dob: tutorEntity.dateOfBirth ? new Date(tutorEntity.dateOfBirth).toISOString().split('T')[0] : '',
      educationLevel: tutorEntity.educationLevel || '',
      major: tutorEntity.major || '',
      experience: tutorEntity.experience || '',
      availableAreas: tutorEntity.availableAreas || '',
      bio: tutorEntity.bio || '',
      university: tutorEntity.university || '',
      graduationYear: tutorEntity.graduationYear || '',
      subjects
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
        rawId: String(cls.id), // Đảm bảo trả về chuỗi UUID chính xác
        studentId: cls.student?.id || '',
        subject: cls.subject?.name || 'Chưa cập nhật',
        type: cls.location?.toLowerCase().includes('online') ? 'Trực tuyến' : 'Tại nhà', 
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

  async findScheduleByTutor(userId: string, targetDate?: string, view: string = 'week'): Promise<any> {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    const baseDate = targetDate ? new Date(targetDate) : new Date();
    let start: Date;
    let end: Date;

    if (view === 'month') {
      start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59);
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
      where: { class: { tutor: { id: tutorId } }, sessionDate: Between(start, end) },
      relations: ['class', 'class.student', 'class.student.user', 'class.subject'],
      order: { startTime: 'ASC' }
    });

    const mapEvent = (s: Schedule) => ({
      id: s.id,
      date: s.sessionDate,
      time: `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`,
      subject: s.class?.subject?.name || 'Môn học',
      student: s.class?.student?.user?.fullName || 'Học viên',
      location: s.class?.location || 'Online',
      status: s.sessionStatus
    });

    if (view === 'month' || view === 'day') {
      return { events: schedules.map(mapEvent), profile };
    }

    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    const calendar = daysOfWeek.map((dayLabel, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const daySchedules = schedules.filter(s => 
        s.sessionDate && new Date(s.sessionDate).toDateString() === date.toDateString()
      );

      return {
        day: dayLabel,
        date: date.getDate().toString(),
        isToday: date.toDateString() === new Date().toDateString(),
        events: daySchedules.map(mapEvent)
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
          avatar: cls.student.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F13-17%2FSoutheast%20Asian%2F2", 
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
      feePerSession: 200000, 
      status: ClassStatus.ACTIVE,
      startDate: new Date(),
      notes: request.requirements,
    });

    return this.classRepository.save(newClass);
  }

  async getNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } }, 
      order: { createdAt: 'DESC' },
      take: 10, 
    });
  }

  async updateTutorProfile(userId: string, updateData: any) {
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { user: { id: userId } }, 
      relations: ['user'] 
    });
    
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy gia sư');

    if (updateData.fullName !== undefined) tutorEntity.user.fullName = updateData.fullName;
    if (updateData.phone !== undefined) tutorEntity.user.phone = updateData.phone;
    if (updateData.address !== undefined) tutorEntity.user.address = updateData.address;
    if (updateData.avatarUrl !== undefined) tutorEntity.user.avatarUrl = updateData.avatarUrl;
    await this.userRepository.save(tutorEntity.user);

    if (updateData.experience !== undefined) tutorEntity.experience = updateData.experience;
    if (updateData.dob !== undefined) tutorEntity.dateOfBirth = updateData.dob ? new Date(updateData.dob) : null as any;
    if (updateData.dateOfBirth !== undefined) tutorEntity.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null as any;
    if (updateData.educationLevel !== undefined) tutorEntity.educationLevel = updateData.educationLevel;
    if (updateData.major !== undefined) tutorEntity.major = updateData.major;
    if (updateData.availableAreas !== undefined) tutorEntity.availableAreas = updateData.availableAreas;
    if (updateData.bio !== undefined) tutorEntity.bio = updateData.bio;
    if (updateData.university !== undefined) tutorEntity.university = updateData.university;
    if (updateData.graduationYear !== undefined) tutorEntity.graduationYear = updateData.graduationYear;

    await this.tutorRepository.save(tutorEntity);

    // Nếu gửi kèm danh sách môn học thì cập nhật luôn môn học
    if (updateData.subjects && Array.isArray(updateData.subjects)) {
      await this.updateTutorSubjects(userId, updateData.subjects);
    }

    return { 
      message: 'Cập nhật hồ sơ thành công', 
      profile: await this.getTutorProfileData(userId) 
    };
  }

  async getTutorSubjects(userId: string) {
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { user: { id: userId } } 
    });
    if (!tutorEntity) throw new NotFoundException('Không tìm thấy gia sư');

    const tutorSubjects = await this.tutorSubjectRepository.find({
      where: { tutor: { id: tutorEntity.id } },
      relations: ['subject']
    });

    return tutorSubjects.map(ts => ts.subject);
  }

  async updateTutorSubjects(userId: string, subjectNames: string[]) {
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { user: { id: userId } } 
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
          yearsExperience: 2
        });
        await this.tutorSubjectRepository.save(ts);
      }
    }

    return { message: 'Cập nhật danh sách môn học thành công' };
  }

  async getReportsByClass(classId: string, userId: string) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id;

    return this.learningReportRepository.find({
      where: { class: { id: classId }, tutor: { id: tutorId } },
      order: { reportDate: 'DESC' }
    });
  }

  async createReport(userId: string, dto: CreateLearningReportDto) {
    const profile = await this.getTutorProfileData(userId);
    const tutorId = profile.id; 

    const classInstance = await this.classRepository.findOne({
      where: { id: dto.classId },
      relations: ['tutor'],
    });

    if (!classInstance) throw new NotFoundException(`Không tìm thấy lớp học với ID ${dto.classId}`);
    if (classInstance.tutor.id !== tutorId) throw new ForbiddenException('Bạn không có quyền nộp báo cáo.');

    const { classId, ...reportData } = dto;

    const newReport = this.learningReportRepository.create({
      ...reportData,
      class: { id: classId },
      tutor: { id: tutorId },
      reportDate: new Date(),
    });

    return this.learningReportRepository.save(newReport);
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

  async seedMockData() {
    const TEST_TUTOR_ID = '00000000-0000-0000-0003-000000000001';

    // 1. Tạo hoặc lấy Role mẫu
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
        id: TEST_TUTOR_ID,
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

    // 4. Tạo Class & Schedule
    const existingClass = await this.classRepository.count({ where: { tutor: { id: tutor.id } } });
    if (existingClass === 0) {
      const cls = await this.classRepository.save(this.classRepository.create({
        tutor, student, subject: math, status: ClassStatus.ACTIVE, feePerSession: 200000, totalSessions: 20
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

    return { message: 'Mock data seeded' };
  }

  async getPublicTutors(params: {
    search?: string;
    subject?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', subject = '', page = 1, limit = 12 } = params;
    return {
      data: [],
      meta: { total: 0, page, limit },
    };
  }
}
