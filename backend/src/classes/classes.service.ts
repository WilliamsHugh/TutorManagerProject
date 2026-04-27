import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Class, ClassStatus } from './class.entity';
import { Schedule } from './schedule.entity';
import { LearningReport } from './learning-report.entity';
import { CreateLearningReportDto } from './create-report.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(LearningReport)
    private readonly learningReportRepository: Repository<LearningReport>,
  ) {}

  async getTutorDashboard(tutorId: string) {
    // ==========================================
    // 1. LẤY DỮ LIỆU THỐNG KÊ (STATS)
    // ==========================================
    const activeClasses = await this.classRepository.count({
      where: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE },
    });

    const stats = [
      { label: 'Lớp đang phụ trách', value: activeClasses.toString(), icon: 'lucide:book-open', color: 'blue' },
      { label: 'Giờ dạy tuần này', value: '12h', icon: 'lucide:clock', color: 'green' },
      { label: 'Đánh giá trung bình', value: '4.9', sub: '/5.0', icon: 'lucide:star', color: 'orange' },
      { label: 'Thu nhập dự kiến', value: '4,500,000đ', icon: 'lucide:wallet', color: 'purple' },
    ];

    // ==========================================
    // 2. LẤY DỮ LIỆU LỊCH DẠY TUẦN NÀY
    // ==========================================
    const today = new Date();
    const currentDay = today.getDay(); 
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
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
    });

    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const calendar = daysOfWeek.map((dayLabel, index) => {
      const dateOfThisDay = new Date(monday);
      dateOfThisDay.setDate(monday.getDate() + index);
      const dateStr = dateOfThisDay.getDate().toString();
      const isToday = dateOfThisDay.toDateString() === today.toDateString();

      const scheduleForDay = weeklySchedules.find(
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

    const currentClasses = myClasses.map(cls => ({
      id: `#L${cls.id}`,
      subject: cls.subject?.name || 'Chưa cập nhật',
      type: 'Online / Offline', 
      student: cls.student?.user?.fullName || 'Chưa có',
      initials: cls.student?.user?.fullName?.substring(0, 2).toUpperCase() || 'NA',
      schedule: 'Đang cập nhật', 
      progress: 50, 
      sessions: '10/20', 
      status: 'success'
    }));

    return { stats, calendar, currentClasses, suggestedClasses: [] };
  }

  // Các hàm khác để Controller không bị lỗi báo đỏ
  async findScheduleByTutor(tutorId: string) {
    // Lấy toàn bộ lịch dạy của gia sư
    const schedules = await this.scheduleRepository.find({
      where: { class: { tutor: { id: tutorId } } },
      relations: ['class', 'class.student', 'class.student.user', 'class.subject'],
      order: { sessionDate: 'ASC', startTime: 'ASC' }
    });

    // Map dữ liệu khớp với frontend trang Calendar
    return schedules.map(item => ({
      subject: item.class?.subject?.name || 'Chưa cập nhật',
      time: `${item.startTime} - ${item.endTime} (${item.sessionDate ? new Date(item.sessionDate).toLocaleDateString('vi-VN') : item.dayOfWeek})`,
      location: item.class?.location || 'Online',
      studentName: item.class?.student?.user?.fullName || 'Chưa có',
    }));
  }

  async createReport(tutorId: string, dto: CreateLearningReportDto) {
    const classInstance = await this.classRepository.findOne({
      where: { id: dto.classId },
      relations: ['tutor'],
    });

    if (!classInstance) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${dto.classId}`);
    }

    // Đảm bảo gia sư nộp báo cáo chính là gia sư của lớp học
    if (classInstance.tutor.id !== tutorId) {
      throw new ForbiddenException('Bạn không có quyền nộp báo cáo cho lớp học này.');
    }

    const newReport = this.learningReportRepository.create({
      ...dto,
      class: { id: dto.classId },
      tutor: { id: tutorId },
      reportDate: new Date(),
    });

    return this.learningReportRepository.save(newReport);
  }
}
