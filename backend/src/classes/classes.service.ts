import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Class, ClassStatus } from './entities/class.entity';
import { ClassRequest, RequestStatus } from './entities/class-request.entity';
import { Schedule, SessionStatus } from './entities/schedule.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Review } from './entities/review.entity';
import { LearningReport } from './entities/learning-report.entity';
import { User } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

type ClassesQuery = {
  status?: ClassStatus;
};

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    @InjectRepository(ClassRequest)
    private readonly classRequestsRepository: Repository<ClassRequest>,
    @InjectRepository(Tutor)
    private readonly tutorsRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateClassDto, createdBy?: User) {
    const request = await this.classRequestsRepository.findOne({
      where: { id: dto.requestId },
      relations: {
        student: { user: true },
        subject: true,
      },
    });
    if (!request)
      throw new NotFoundException('Không tìm thấy yêu cầu tìm gia sư');

    const existingClass = await this.classesRepository.findOne({
      where: { request: { id: dto.requestId } },
    });
    if (existingClass) {
      throw new ConflictException('Yêu cầu này đã được tạo lớp');
    }

    if (request.status !== RequestStatus.MATCHED) {
      throw new BadRequestException(
        'Yêu cầu này chưa được thống nhất ghép lớp giữa gia sư và học viên',
      );
    }

    const tutor = await this.tutorsRepository.findOne({
      where: { id: dto.tutorId },
      relations: { user: true },
    });
    if (!tutor) throw new NotFoundException('Không tìm thấy gia sư');

    // --- CHECK CONFLICTING SCHEDULES ---
    const scheduleStr = request.preferredSchedule;
    if (scheduleStr && scheduleStr !== 'Linh hoạt') {
      try {
        // Parse preferredSchedule e.g. "Tối Thứ 2, Thứ 4 · 19:00 - 21:00"
        const parts = scheduleStr.split('·');
        if (parts.length === 2) {
          const daysPart = parts[0].trim();
          const timePart = parts[1].trim();

          // Extract days e.g. ['Thứ 2', 'Thứ 4']
          const days: string[] = [];
          const allDayNames = [
            'Thứ 2',
            'Thứ 3',
            'Thứ 4',
            'Thứ 5',
            'Thứ 6',
            'Thứ 7',
            'Chủ nhật',
          ];
          allDayNames.forEach((d) => {
            if (daysPart.includes(d)) {
              days.push(d);
            }
          });

          // Extract times e.g. "19:00 - 21:00"
          const timeParts = timePart.split('-');
          if (timeParts.length === 2 && days.length > 0) {
            const startTimeStr = timeParts[0].trim() + ':00';
            const endTimeStr = timeParts[1].trim() + ':00';

            // Query existing schedules for the tutor and student
            const conflictingSchedules = await this.scheduleRepository
              .createQueryBuilder('schedule')
              .leftJoinAndSelect('schedule.class', 'class')
              .leftJoinAndSelect('class.tutor', 'tutor')
              .leftJoinAndSelect('class.student', 'student')
              .leftJoinAndSelect('tutor.user', 'tutorUser')
              .leftJoinAndSelect('student.user', 'studentUser')
              .where('class.status = :status', { status: ClassStatus.ACTIVE })
              .andWhere('schedule.dayOfWeek IN (:...days)', { days })
              .andWhere(
                '((schedule.startTime < :endTime AND schedule.endTime > :startTime))',
                { startTime: startTimeStr, endTime: endTimeStr },
              )
              .getMany();

            for (const s of conflictingSchedules) {
              const classCode = `CLASS-${s.class.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
              if (s.class.tutor?.id === tutor.id) {
                throw new ConflictException(
                  `Gia sư ${tutor.user?.fullName} đã bị trùng lịch dạy vào ${s.dayOfWeek} từ ${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)} ở lớp ${classCode}.`,
                );
              }
              if (s.class.student?.id === request.student?.id) {
                throw new ConflictException(
                  `Học viên ${request.student?.user?.fullName} đã bị trùng lịch học vào ${s.dayOfWeek} từ ${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)} ở lớp ${classCode}.`,
                );
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof ConflictException) throw err;
        // Ignore parsing errors and proceed with creation
      }
    }

    const classEntity = this.classesRepository.create({
      request,
      tutor,
      student: request.student,
      subject: request.subject,
      createdBy,
      location: dto.location,
      feePerSession: dto.feePerSession ? Number(dto.feePerSession) : undefined,
      totalSessions: dto.totalSessions ? Number(dto.totalSessions) : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      notes: dto.notes,
      status: ClassStatus.ACTIVE,
    });

    const savedClass = await this.classesRepository.save(classEntity);
    request.status = RequestStatus.MATCHED;
    if (createdBy) request.handledBy = createdBy;
    await this.classRequestsRepository.save(request);

    // Automatically generate weekly session schedules
    console.log(
      '[createClass] request.preferredSchedule:',
      request.preferredSchedule,
      '| totalSessions:',
      savedClass.totalSessions,
      '| startDate:',
      savedClass.startDate,
    );
    if (request.preferredSchedule) {
      await this.generateSchedulesForClass(
        savedClass,
        request.preferredSchedule,
        savedClass.totalSessions || 24,
        savedClass.startDate || new Date(),
      );
    } else {
      console.log(
        '[createClass] No preferredSchedule found on request - skipping schedule generation',
      );
    }

    if (request.student?.user?.id) {
      await this.notificationsService.createNotification(
        request.student.user.id,
        'Lớp học mới đã được tạo',
        `Lớp học môn ${request.subject?.name} của bạn với gia sư ${tutor.user?.fullName || 'Gia sư'} đã được thiết lập thành công.`,
        NotificationType.CLASS_CONFIRMED,
      );
    }
    if (tutor.user?.id) {
      await this.notificationsService.createNotification(
        tutor.user.id,
        'Lớp học mới đã được tạo',
        `Lớp học môn ${request.subject?.name} của bạn với học viên ${request.student?.user?.fullName || 'Học viên'} đã được thiết lập thành công.`,
        NotificationType.CLASS_CONFIRMED,
      );
    }

    return savedClass;
  }

  async generateSchedulesForClass(
    classEntity: Class,
    scheduleStr: string,
    totalSessions: number,
    startDate: Date,
  ) {
    console.log('[generateSchedules] Called with:', {
      scheduleStr,
      totalSessions,
      startDate: startDate?.toISOString(),
    });
    if (!scheduleStr || scheduleStr === 'Linh hoạt') {
      console.log('[generateSchedules] Skipped: empty or flexible schedule');
      return;
    }

    try {
      const dayMap: Record<string, number> = {
        'thứ 2': 1,
        'thứ 3': 2,
        'thứ 4': 3,
        'thứ 5': 4,
        'thứ 6': 5,
        'thứ 7': 6,
        'chủ nhật': 0,
        cn: 0,
      };

      const dayNames = [
        'Thứ 2',
        'Thứ 3',
        'Thứ 4',
        'Thứ 5',
        'Thứ 6',
        'Thứ 7',
        'Chủ nhật',
      ];
      const parsedSchedules: {
        dayVal: number;
        dayName: string;
        startTime: string;
        endTime: string;
      }[] = [];

      // Helper: normalize time string to HH:MM:SS
      const normalizeTime = (t: string): string => {
        const clean = t.trim();
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(clean)) return clean; // already HH:MM:SS
        if (/^\d{1,2}:\d{2}$/.test(clean)) return clean + ':00'; // HH:MM -> HH:MM:00
        return clean;
      };

      // Check for middle dot separator (·)
      if (scheduleStr.includes('·')) {
        const parts = scheduleStr.split('·');
        if (parts.length === 2) {
          const daysPart = parts[0].trim();
          const timePart = parts[1].trim();
          const timeParts = timePart.split('-');
          if (timeParts.length === 2) {
            const startTimeStr = normalizeTime(timeParts[0]);
            const endTimeStr = normalizeTime(timeParts[1]);

            Object.keys(dayMap).forEach((dayKey) => {
              if (daysPart.toLowerCase().includes(dayKey)) {
                const dayVal = dayMap[dayKey];
                const dayName =
                  dayNames.find((d) => d.toLowerCase() === dayKey) || 'Thứ 2';
                parsedSchedules.push({
                  dayVal,
                  dayName,
                  startTime: startTimeStr,
                  endTime: endTimeStr,
                });
              }
            });
          }
        }
      }

      // Check for parentheses format: "Thứ 3 (19:00-21:00), Thứ 6 (19:00-21:00)"
      if (parsedSchedules.length === 0 && scheduleStr.includes('(')) {
        const items = scheduleStr.split(',');
        items.forEach((item) => {
          const trimmedItem = item.trim().toLowerCase();
          const timeMatch = trimmedItem.match(/\(([^)]+)\)/);
          if (timeMatch) {
            const timeStr = timeMatch[1].trim();
            const timeParts = timeStr.split('-');
            if (timeParts.length === 2) {
              const startTimeStr = normalizeTime(timeParts[0]);
              const endTimeStr = normalizeTime(timeParts[1]);

              Object.keys(dayMap).forEach((dayKey) => {
                const dayTextOnly = trimmedItem.split('(')[0];
                if (dayTextOnly.includes(dayKey)) {
                  const dayVal = dayMap[dayKey];
                  const dayName =
                    dayNames.find((d) => d.toLowerCase() === dayKey) || 'Thứ 2';
                  parsedSchedules.push({
                    dayVal,
                    dayName,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                  });
                }
              });
            }
          }
        });
      }

      console.log(
        '[generateSchedules] Parsed schedules:',
        JSON.stringify(parsedSchedules),
      );

      if (parsedSchedules.length === 0) {
        console.log(
          '[generateSchedules] No schedules parsed from:',
          scheduleStr,
        );
        return;
      }

      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);

      let sessionsCreated = 0;
      const targetDays = parsedSchedules.map((p) => p.dayVal);

      // Safety: prevent infinite loop (max 365 days lookahead)
      let maxIterations = 365;
      while (sessionsCreated < totalSessions && maxIterations > 0) {
        maxIterations--;
        const dayOfWeekVal = currentDate.getDay(); // 0-6
        if (targetDays.includes(dayOfWeekVal)) {
          const matchedItem = parsedSchedules.find(
            (p) => p.dayVal === dayOfWeekVal,
          );
          if (matchedItem) {
            const schedule = this.scheduleRepository.create({
              class: classEntity,
              dayOfWeek: matchedItem.dayName,
              startTime: matchedItem.startTime,
              endTime: matchedItem.endTime,
              sessionDate: new Date(currentDate),
              sessionStatus: SessionStatus.SCHEDULED,
              note: `Buổi học số ${sessionsCreated + 1}`,
            });

            await this.scheduleRepository.save(schedule);
            sessionsCreated++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      console.log(
        `[generateSchedules] Created ${sessionsCreated} sessions for class ${classEntity.id}`,
      );
    } catch (err) {
      console.error('Failed to generate schedules for class:', err);
    }
  }

  async findAll(query: ClassesQuery = {}) {
    const qb = this.classesRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.tutor', 'tutor')
      .leftJoinAndSelect('tutor.user', 'tutorUser')
      .leftJoinAndSelect('class.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('class.subject', 'subject')
      .leftJoinAndSelect('class.request', 'request')
      .leftJoinAndSelect('class.createdBy', 'createdBy')
      .orderBy('class.startDate', 'DESC', 'NULLS LAST');

    if (query.status) {
      qb.andWhere('class.status = :status', { status: query.status });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const classEntity = await this.classesRepository.findOne({
      where: { id },
      relations: {
        tutor: { user: true },
        student: { user: true },
        subject: true,
        request: true,
        createdBy: true,
        suspendedBy: true,
      },
    });
    if (!classEntity) throw new NotFoundException('Không tìm thấy lớp học');
    return classEntity;
  }

  async updateStatus(id: string, status: ClassStatus, user?: any) {
    const classEntity = await this.findOne(id);
    classEntity.status = status;
    classEntity.suspendedBy = status === ClassStatus.SUSPENDED ? user : null;
    const saved = await this.classesRepository.save(classEntity);

    // Cancel remaining scheduled sessions if class is cancelled
    if (status === ClassStatus.CANCELLED) {
      await this.scheduleRepository.update(
        {
          class: { id: classEntity.id },
          sessionStatus: SessionStatus.SCHEDULED,
        },
        { sessionStatus: SessionStatus.CANCELLED },
      );
    }

    // Send notifications to Tutor & Student
    let title = '';
    let message = '';
    const subjectName = classEntity.subject?.name || 'môn học';

    if (status === ClassStatus.SUSPENDED) {
      title = 'Lớp học tạm dừng';
      message = `Lớp học môn ${subjectName} của bạn đã bị tạm dừng bởi trung tâm.`;
    } else if (status === ClassStatus.COMPLETED) {
      title = 'Lớp học hoàn thành';
      message = `Lớp học môn ${subjectName} của bạn đã hoàn thành / kết thúc.`;
    } else if (status === ClassStatus.CANCELLED) {
      title = 'Lớp học bị hủy';
      message = `Lớp học môn ${subjectName} của bạn đã bị hủy bởi trung tâm.`;
    } else if (status === ClassStatus.ACTIVE) {
      title = 'Lớp học hoạt động lại';
      message = `Lớp học môn ${subjectName} của bạn đã hoạt động trở lại bình thường.`;
    }

    if (title && message) {
      if (classEntity.student?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.student.user.id,
          title,
          message,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
      if (classEntity.tutor?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.tutor.user.id,
          title,
          message,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
    }

    return saved;
  }

  async findStudentSchedule(userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const schedules = await this.scheduleRepository.find({
      where: {
        class: {
          student: { id: student.id },
          status: In([ClassStatus.ACTIVE, ClassStatus.COMPLETED]),
        },
      },
      relations: ['class', 'class.subject', 'class.tutor', 'class.tutor.user'],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });

    return schedules;
  }

  async findStudentClasses(userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const classes = await this.classesRepository.find({
      where: { student: { id: student.id } },
      relations: {
        tutor: { user: true },
        subject: true,
      },
      order: {
        startDate: 'DESC',
      },
    });

    const requests = await this.classRequestsRepository.find({
      where: {
        student: { id: student.id },
        status: In([RequestStatus.PENDING, RequestStatus.PROCESSING]),
      },
      relations: {
        preferredTutor: { user: true },
        subject: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Map class requests to look like classes for the UI
    const requestItems = requests.map((req) => ({
      id: req.id,
      isRequest: true,
      location: req.preferredArea || 'Chưa xác định',
      feePerSession: 0,
      totalSessions: 0,
      status: req.status, // 'pending' or 'processing'
      startDate: req.createdAt
        ? req.createdAt.toISOString()
        : new Date().toISOString(),
      endDate: req.createdAt
        ? req.createdAt.toISOString()
        : new Date().toISOString(),
      notes: req.requirements || '',
      subject: req.subject,
      tutor: req.preferredTutor
        ? {
            id: req.preferredTutor.id,
            educationLevel: req.preferredTutor.educationLevel || '',
            major: req.preferredTutor.major || '',
            experience: req.preferredTutor.experience || '',
            bio: req.preferredTutor.bio || '',
            availableAreas: req.preferredTutor.availableAreas || '',
            university: req.preferredTutor.university || '',
            user: {
              fullName: req.preferredTutor.user?.fullName || '',
              email: req.preferredTutor.user?.email || '',
              phone: req.preferredTutor.user?.phone || '',
            },
          }
        : null,
    }));

    return [...requestItems, ...classes];
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const classEntity = await this.classesRepository.findOne({
      where: { id: dto.classId },
      relations: {
        student: true,
        tutor: true,
      },
    });
    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (classEntity.student.id !== student.id) {
      throw new ConflictException(
        'Bạn không thuộc lớp học này để thực hiện đánh giá',
      );
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        class: { id: dto.classId },
        student: { id: student.id },
      },
    });
    if (existingReview) {
      throw new ConflictException('Bạn đã thực hiện đánh giá lớp học này rồi');
    }

    const review = this.reviewsRepository.create({
      class: classEntity,
      student,
      tutor: classEntity.tutor,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.reviewsRepository.save(review);
  }

  async getReviewsByTutor(tutorId: string) {
    return this.reviewsRepository.find({
      where: { tutor: { id: tutorId } },
      relations: {
        student: { user: true },
        class: { subject: true },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getClassReview(classId: string) {
    return this.reviewsRepository.findOne({
      where: { class: { id: classId } },
      relations: {
        student: { user: true },
      },
    });
  }

  async getReviewsByStudent(userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên');
    }

    return this.reviewsRepository.find({
      where: { student: { id: student.id } },
      relations: {
        tutor: { user: true },
        class: { subject: true },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getTutorSchedules(tutorId: string) {
    return this.scheduleRepository.find({
      where: {
        class: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE },
      },
      relations: [
        'class',
        'class.subject',
        'class.student',
        'class.student.user',
      ],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async getStudentSchedules(studentId: string) {
    return this.scheduleRepository.find({
      where: {
        class: { student: { id: studentId }, status: ClassStatus.ACTIVE },
      },
      relations: ['class', 'class.subject', 'class.tutor', 'class.tutor.user'],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async getClassSchedules(classId: string) {
    return this.scheduleRepository.find({
      where: {
        class: { id: classId },
      },
      relations: [
        'class',
        'class.subject',
        'class.tutor',
        'class.tutor.user',
        'class.student',
        'class.student.user',
      ],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async createSchedule(classId: string, dto: CreateScheduleDto) {
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId },
      relations: {
        tutor: { user: true },
        student: { user: true },
        subject: true,
      },
    });
    if (!classEntity) throw new NotFoundException('Không tìm thấy lớp học');

    const schedule = this.scheduleRepository.create({
      class: classEntity,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : undefined,
      sessionStatus: dto.sessionStatus,
      note: dto.note,
    });

    const savedSchedule = await this.scheduleRepository.save(schedule);

    if (classEntity.student?.user?.id) {
      await this.notificationsService.createNotification(
        classEntity.student.user.id,
        'Lịch học mới được thêm',
        `Một buổi học mới cho môn ${classEntity.subject?.name || 'môn học'} đã được thêm vào ngày ${schedule.sessionDate ? new Date(schedule.sessionDate).toLocaleDateString('vi-VN') : schedule.dayOfWeek} lúc ${schedule.startTime.slice(0, 5)}.`,
        NotificationType.SCHEDULE_CHANGED,
      );
    }
    if (classEntity.tutor?.user?.id) {
      await this.notificationsService.createNotification(
        classEntity.tutor.user.id,
        'Lịch học mới được thêm',
        `Một buổi học mới cho môn ${classEntity.subject?.name || 'môn học'} đã được thêm vào ngày ${schedule.sessionDate ? new Date(schedule.sessionDate).toLocaleDateString('vi-VN') : schedule.dayOfWeek} lúc ${schedule.startTime.slice(0, 5)}.`,
        NotificationType.SCHEDULE_CHANGED,
      );
    }

    return savedSchedule;
  }

  async updateSchedule(
    classId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
  ) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, class: { id: classId } },
      relations: {
        class: {
          tutor: { user: true },
          student: { user: true },
          subject: true,
        },
      },
    });
    if (!schedule)
      throw new NotFoundException(
        'Không tìm thấy buổi học tương ứng trong lớp này',
      );

    if (dto.dayOfWeek !== undefined) schedule.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime !== undefined) schedule.startTime = dto.startTime;
    if (dto.endTime !== undefined) schedule.endTime = dto.endTime;
    if (dto.sessionDate !== undefined)
      schedule.sessionDate = dto.sessionDate
        ? new Date(dto.sessionDate)
        : (null as any);
    if (dto.sessionStatus !== undefined)
      schedule.sessionStatus = dto.sessionStatus;
    if (dto.note !== undefined) schedule.note = dto.note;

    const savedSchedule = await this.scheduleRepository.save(schedule);
    const classEntity = schedule.class;

    if (classEntity) {
      if (classEntity.student?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.student.user.id,
          'Lịch học thay đổi',
          `Lịch học môn ${classEntity.subject?.name || 'môn học'} đã được cập nhật vào ngày ${schedule.sessionDate ? new Date(schedule.sessionDate).toLocaleDateString('vi-VN') : schedule.dayOfWeek} lúc ${schedule.startTime.slice(0, 5)}.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
      if (classEntity.tutor?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.tutor.user.id,
          'Lịch học thay đổi',
          `Lịch học môn ${classEntity.subject?.name || 'môn học'} đã được cập nhật vào ngày ${schedule.sessionDate ? new Date(schedule.sessionDate).toLocaleDateString('vi-VN') : schedule.dayOfWeek} lúc ${schedule.startTime.slice(0, 5)}.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
    }

    return savedSchedule;
  }

  async deleteSchedule(classId: string, scheduleId: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, class: { id: classId } },
      relations: {
        class: {
          tutor: { user: true },
          student: { user: true },
          subject: true,
        },
      },
    });
    if (!schedule)
      throw new NotFoundException(
        'Không tìm thấy buổi học tương ứng trong lớp này',
      );

    const classEntity = schedule.class;
    await this.scheduleRepository.remove(schedule);

    if (classEntity) {
      if (classEntity.student?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.student.user.id,
          'Lịch học bị hủy',
          `Một buổi học môn ${classEntity.subject?.name || 'môn học'} vào ngày ${schedule.sessionDate ? new Date(schedule.sessionDate).toLocaleDateString('vi-VN') : schedule.dayOfWeek} đã bị hủy.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
      if (classEntity.tutor?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.tutor.user.id,
          'Lịch học bị hủy',
          `Một buổi học môn ${classEntity.subject?.name || 'môn học'} vào ngày ${schedule.sessionDate ? new Date(schedule.sessionDate).toLocaleDateString('vi-VN') : schedule.dayOfWeek} đã bị hủy.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
    }

    return { success: true };
  }

  async getStudentClassReports(userId: string, classId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, student: { id: student.id } },
    });
    if (!classEntity) {
      throw new NotFoundException(
        'Không tìm thấy lớp học hoặc bạn không thuộc lớp này',
      );
    }

    const reportRepo =
      this.classesRepository.manager.getRepository(LearningReport);
    return reportRepo.find({
      where: { class: { id: classId } },
      relations: ['tutor', 'tutor.user'],
      order: { reportDate: 'DESC' },
    });
  }

  async declineProposal(requestId: string, userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên');
    }

    const request = await this.classRequestsRepository.findOne({
      where: { id: requestId },
      relations: {
        student: { user: true },
        preferredTutor: { user: true },
        subject: true,
      },
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (request.student.id !== student.id) {
      throw new BadRequestException('Bạn không có quyền từ chối yêu cầu này');
    }
    if (request.status !== RequestStatus.PROPOSED) {
      throw new BadRequestException(
        'Yêu cầu này không ở trạng thái chờ xác nhận',
      );
    }

    const tutor = request.preferredTutor;
    request.preferredTutor = null as any;
    request.proposedFee = null as any;
    request.proposedSessions = null as any;
    request.proposedAt = null as any;
    request.status = RequestStatus.PENDING;
    request.requirements = [
      request.requirements || '',
      '[Học viên đã từ chối đề xuất từ gia sư này. Yêu cầu mở lại cho tất cả gia sư.]',
    ]
      .filter(Boolean)
      .join('\n');
    await this.classRequestsRepository.save(request);

    if (tutor && tutor.user?.id) {
      await this.notificationsService.createNotification(
        tutor.user.id,
        'Đề xuất bị từ chối',
        `Học viên ${student.user?.fullName || 'Ẩn danh'} đã từ chối đề xuất của bạn cho môn ${request.subject?.name || 'môn học'}.`,
        NotificationType.TUTOR_REJECTED,
      );
    }

    return { message: 'Bạn đã từ chối đề xuất của gia sư.' };
  }

  async counterProposal(
    requestId: string,
    userId: string,
    note: string,
    feePerSession?: number,
    totalSessions?: number,
    schedule?: string,
  ) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên');
    }

    const request = await this.classRequestsRepository.findOne({
      where: { id: requestId },
      relations: {
        student: { user: true },
        preferredTutor: { user: true },
        subject: true,
      },
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (request.student.id !== student.id) {
      throw new BadRequestException(
        'Bạn không có quyền yêu cầu sửa đề xuất này',
      );
    }
    if (request.status !== RequestStatus.PROPOSED) {
      throw new BadRequestException(
        'Yêu cầu này không ở trạng thái chờ xác nhận',
      );
    }

    if (feePerSession) request.proposedFee = feePerSession;
    if (totalSessions) request.proposedSessions = totalSessions;
    if (schedule) request.preferredSchedule = schedule;

    request.status = RequestStatus.NEGOTIATING;

    const adjustText = [
      note ? `Lời nhắn: ${note}` : '',
      feePerSession
        ? `Học phí: ${feePerSession.toLocaleString('vi-VN')}đ/buổi`
        : '',
      totalSessions ? `Số buổi: ${totalSessions} buổi` : '',
      schedule ? `Lịch học: ${schedule}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    request.requirements = [
      request.requirements || '',
      `[Học viên yêu cầu điều chỉnh - ${adjustText}]`,
    ]
      .filter(Boolean)
      .join('\n');
    await this.classRequestsRepository.save(request);

    if (request.preferredTutor && request.preferredTutor.user?.id) {
      const msg = `Học viên ${student.user?.fullName || 'Ẩn danh'} yêu cầu điều chỉnh đề xuất môn ${request.subject?.name || 'môn học'}: ${adjustText}.`;
      await this.notificationsService.createNotification(
        request.preferredTutor.user.id,
        'Yêu cầu điều chỉnh đề xuất',
        msg,
        NotificationType.SCHEDULE_CHANGED,
      );
    }

    return {
      message:
        'Bạn đã gửi yêu cầu điều chỉnh. Gia sư sẽ xem xét và gửi đề xuất mới.',
    };
  }

  async requestClassCancellation(
    classId: string,
    userId: string,
    role: 'tutor' | 'student',
    reason: string,
  ) {
    const classEntity = await this.findOne(classId);

    // Verify ownership
    if (role === 'student') {
      const student = await this.studentsRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!student || classEntity.student.id !== student.id) {
        throw new BadRequestException('Bạn không phải học viên của lớp này');
      }
    } else if (role === 'tutor') {
      const tutor = await this.tutorsRepository.findOne({
        where: { user: { id: userId } },
        relations: { user: true },
      });
      if (!tutor || classEntity.tutor.id !== tutor.id) {
        throw new BadRequestException('Bạn không phải gia sư của lớp này');
      }
    }

    if (classEntity.status !== ClassStatus.ACTIVE) {
      throw new BadRequestException(
        'Chỉ có thể yêu cầu hủy lớp đang hoạt động',
      );
    }

    classEntity.status = ClassStatus.CANCELLATION_REQUESTED;
    classEntity.cancellationRequestedBy = role;
    classEntity.cancellationReason = reason;
    classEntity.cancellationRequestedAt = new Date();
    await this.classesRepository.save(classEntity);

    if (role === 'student' && classEntity.tutor?.user?.id) {
      await this.notificationsService.createNotification(
        classEntity.tutor.user.id,
        'Yêu cầu hủy lớp học',
        `Học viên ${classEntity.student?.user?.fullName || 'Ẩn danh'} đã yêu cầu hủy lớp học môn ${classEntity.subject?.name || 'môn học'}. Lý do: "${reason}".`,
        NotificationType.SCHEDULE_CHANGED,
      );
    } else if (role === 'tutor' && classEntity.student?.user?.id) {
      await this.notificationsService.createNotification(
        classEntity.student.user.id,
        'Yêu cầu hủy lớp học',
        `Gia sư ${classEntity.tutor?.user?.fullName || 'Gia sư'} đã yêu cầu hủy lớp học môn ${classEntity.subject?.name || 'môn học'}. Lý do: "${reason}".`,
        NotificationType.SCHEDULE_CHANGED,
      );
    }

    const roleName = role === 'tutor' ? 'Gia sư' : 'Học viên';
    return {
      message: `${roleName} đã yêu cầu hủy lớp. Vui lòng chờ bên kia xác nhận.`,
    };
  }

  async respondToCancellation(
    classId: string,
    userId: string,
    role: 'tutor' | 'student',
    agree: boolean,
  ) {
    const classEntity = await this.findOne(classId);

    if (classEntity.status !== ClassStatus.CANCELLATION_REQUESTED) {
      throw new BadRequestException('Lớp này chưa có yêu cầu hủy');
    }

    // Verify ownership + the other side is responding
    if (role === 'tutor') {
      const tutor = await this.tutorsRepository.findOne({
        where: { user: { id: userId } },
        relations: { user: true },
      });
      if (!tutor || classEntity.tutor.id !== tutor.id) {
        throw new BadRequestException('Bạn không phải gia sư của lớp này');
      }
      if (classEntity.cancellationRequestedBy === 'tutor') {
        throw new BadRequestException(
          'Bạn đã yêu cầu hủy, không thể tự phản hồi',
        );
      }
    } else if (role === 'student') {
      const student = await this.studentsRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!student || classEntity.student.id !== student.id) {
        throw new BadRequestException('Bạn không phải học viên của lớp này');
      }
      if (classEntity.cancellationRequestedBy === 'student') {
        throw new BadRequestException(
          'Bạn đã yêu cầu hủy, không thể tự phản hồi',
        );
      }
    }

    if (agree) {
      classEntity.status = ClassStatus.CANCELLED;
      await this.classesRepository.save(classEntity);

      // Also update the request status if present
      if (classEntity.request) {
        classEntity.request.status = RequestStatus.CANCELLED;
        await this.classRequestsRepository.save(classEntity.request);
      }

      // Hủy tất cả các lịch học của lớp này từ hôm nay trở đi
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await this.scheduleRepository
        .createQueryBuilder()
        .update()
        .set({ sessionStatus: SessionStatus.CANCELLED as any })
        .where('class_id = :classId', { classId })
        .andWhere('session_date >= :today', { today })
        .andWhere('session_status = :status', { status: SessionStatus.SCHEDULED })
        .execute();

      if (classEntity.student?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.student.user.id,
          'Lớp học đã bị hủy',
          `Yêu cầu hủy lớp học môn ${classEntity.subject?.name || 'môn học'} đã được đồng ý. Lớp học đã được đóng.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
      if (classEntity.tutor?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.tutor.user.id,
          'Lớp học đã bị hủy',
          `Yêu cầu hủy lớp học môn ${classEntity.subject?.name || 'môn học'} đã được đồng ý. Lớp học đã được đóng.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }

      return { message: 'Đã đồng ý hủy lớp. Lớp học đã được hủy.' };
    } else {
      classEntity.status = ClassStatus.ACTIVE;
      classEntity.cancellationRequestedBy = null as any;
      classEntity.cancellationReason = null as any;
      classEntity.cancellationRequestedAt = null as any;
      await this.classesRepository.save(classEntity);

      if (classEntity.student?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.student.user.id,
          'Từ chối yêu cầu hủy lớp',
          `Yêu cầu hủy lớp học môn ${classEntity.subject?.name || 'môn học'} đã bị từ chối. Lớp học tiếp tục hoạt động.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }
      if (classEntity.tutor?.user?.id) {
        await this.notificationsService.createNotification(
          classEntity.tutor.user.id,
          'Từ chối yêu cầu hủy lớp',
          `Yêu cầu hủy lớp học môn ${classEntity.subject?.name || 'môn học'} đã bị từ chối. Lớp học tiếp tục hoạt động.`,
          NotificationType.SCHEDULE_CHANGED,
        );
      }

      return { message: 'Đã từ chối hủy lớp. Lớp học tiếp tục hoạt động.' };
    }
  }

  async confirmProposal(requestId: string, userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const request = await this.classRequestsRepository.findOne({
      where: { id: requestId },
      relations: {
        student: { user: true },
        subject: true,
        preferredTutor: { user: true },
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu');
    }

    // Verify this is the student's own request
    if (request.student.id !== student.id) {
      throw new BadRequestException('Bạn không có quyền xác nhận yêu cầu này');
    }

    if (request.status !== RequestStatus.PROPOSED) {
      throw new BadRequestException(
        'Yêu cầu này không ở trạng thái chờ xác nhận',
      );
    }

    if (!request.proposedFee || !request.proposedSessions) {
      throw new BadRequestException(
        'Gia sư chưa gửi đề xuất học phí và số buổi',
      );
    }

    if (!request.preferredTutor) {
      throw new NotFoundException('Không tìm thấy gia sư được đề xuất');
    }

    const tutor = request.preferredTutor;

    // Cập nhật trạng thái request
    request.status = RequestStatus.MATCHED;
    await this.classRequestsRepository.save(request);

    // Thông báo cho Gia sư
    if (tutor.user?.id) {
      await this.notificationsService.createNotification(
        tutor.user.id,
        'Học viên đã đồng ý ghép lớp',
        `Học viên ${request.student?.user?.fullName || 'Ẩn danh'} đã đồng ý đề xuất ghép lớp môn ${request.subject?.name}. Vui lòng chờ nhân viên trung tâm duyệt tạo lớp.`,
        NotificationType.CLASS_CONFIRMED,
      );
    }
    // Thông báo cho Học viên
    if (request.student?.user?.id) {
      await this.notificationsService.createNotification(
        request.student.user.id,
        'Gửi xác nhận thành công',
        `Bạn đã đồng ý đề xuất dạy môn ${request.subject?.name} của gia sư ${tutor.user?.fullName || 'Gia sư'}. Yêu cầu đã được gửi lên hệ thống chờ nhân viên duyệt tạo lớp.`,
        NotificationType.CLASS_CONFIRMED,
      );
    }
    // Thông báo cho tất cả Staff
    const staffUsers = await this.userRepository.find({
      relations: { role: true },
    });
    for (const staff of staffUsers) {
      if (staff.role?.name === 'staff') {
        await this.notificationsService.createNotification(
          staff.id,
          'Yêu cầu ghép lớp đã hoàn tất đàm phán',
          `Học viên và gia sư đã thống nhất thông tin ghép lớp cho yêu cầu môn ${request.subject?.name || 'môn học'}. Vui lòng tạo lớp học.`,
          NotificationType.NEW_REQUEST,
        );
      }
    }

    return {
      message:
        'Bạn đã xác nhận đề xuất của gia sư thành công! Yêu cầu đã được gửi tới nhân viên trung tâm để duyệt tạo lớp.',
    };
  }

  async getStudentProposals(userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const requests = await this.classRequestsRepository.find({
      where: {
        student: { id: student.id },
        status: RequestStatus.PROPOSED,
      },
      relations: {
        subject: true,
        preferredTutor: { user: true },
      },
      order: { proposedAt: 'DESC' },
    });

    return requests.map((req) => ({
      id: req.id,
      subject: req.subject?.name || 'Môn học',
      preferredArea: req.preferredArea || 'Toàn quốc',
      preferredSchedule: req.preferredSchedule || 'Linh hoạt',
      requirements: req.requirements || '',
      proposedFee: Number(req.proposedFee) || 0,
      proposedSessions: req.proposedSessions || 0,
      totalFee: (Number(req.proposedFee) || 0) * (req.proposedSessions || 0),
      tutorName: req.preferredTutor?.user?.fullName || 'Gia sư',
      tutorId: req.preferredTutor?.id || '',
      proposedAt: req.proposedAt,
    }));
  }

  async getTutorCancellations(tutorId: string) {
    return this.classesRepository.find({
      where: {
        tutor: { id: tutorId },
        status: ClassStatus.CANCELLATION_REQUESTED,
      },
      relations: {
        student: { user: true },
        subject: true,
        tutor: { user: true },
      },
    });
  }

  async getClassCancellationInfo(
    classId: string,
    userId: string,
    role: 'tutor' | 'student',
  ) {
    const classEntity = await this.findOne(classId);

    // Verify ownership
    if (role === 'student') {
      const student = await this.studentsRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!student || classEntity.student.id !== student.id) {
        throw new BadRequestException('Bạn không phải học viên của lớp này');
      }
    } else if (role === 'tutor') {
      const tutor = await this.tutorsRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!tutor || classEntity.tutor.id !== tutor.id) {
        throw new BadRequestException('Bạn không phải gia sư của lớp này');
      }
    }

    if (classEntity.status !== ClassStatus.CANCELLATION_REQUESTED) {
      return { hasCancellationRequest: false };
    }

    // Get the requesting party name
    const otherRole =
      classEntity.cancellationRequestedBy === 'tutor' ? 'student' : 'tutor';
    let requestedByName = '';
    if (classEntity.cancellationRequestedBy === 'tutor') {
      requestedByName = classEntity.tutor?.user?.fullName || 'Gia sư';
    } else {
      requestedByName = classEntity.student?.user?.fullName || 'Học viên';
    }

    return {
      hasCancellationRequest: true,
      requestedBy: classEntity.cancellationRequestedBy,
      otherRole,
      requestedByName,
      reason: classEntity.cancellationReason,
      requestedAt: classEntity.cancellationRequestedAt,
      isMyRequest: classEntity.cancellationRequestedBy === role,
    };
  }

  async getStudentScheduleReport(
    userId: string,
    classId: string,
    sessionDate: string,
  ) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, student: { id: student.id } },
    });
    if (!classEntity) {
      throw new NotFoundException(
        'Không tìm thấy lớp học hoặc bạn không thuộc lớp này',
      );
    }

    const reportRepo =
      this.classesRepository.manager.getRepository(LearningReport);
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const reports = await reportRepo.find({
      where: {
        class: { id: classId },
        reportDate: Between(startOfDay, endOfDay),
      },
      relations: ['tutor', 'tutor.user'],
      order: { reportDate: 'DESC' },
    });

    return reports;
  }

  async recreateClassRequest(classId: string, userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });
    if (!student) {
      throw new NotFoundException(
        'Không tìm thấy học viên tương ứng với tài khoản này',
      );
    }

    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, student: { id: student.id } },
      relations: {
        tutor: { user: true },
        subject: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học cũ của bạn');
    }

    if (
      classEntity.status !== ClassStatus.CANCELLED &&
      classEntity.status !== ClassStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Chỉ có thể đăng ký học lại từ lớp học đã kết thúc hoặc bị hủy',
      );
    }

    // Check if there is already a pending class request with this tutor for this student and subject
    const existingRequest = await this.classRequestsRepository.findOne({
      where: {
        student: { id: student.id },
        preferredTutor: { id: classEntity.tutor.id },
        subject: { id: classEntity.subject.id },
        status: In([
          RequestStatus.PENDING,
          RequestStatus.PROCESSING,
          RequestStatus.PROPOSED,
          RequestStatus.NEGOTIATING,
          RequestStatus.MATCHED,
        ]),
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'Đã tồn tại một yêu cầu đang xử lý với gia sư này cho môn học này',
      );
    }

    // Create a new ClassRequest with MATCHED status
    const classRequest = this.classRequestsRepository.create({
      student,
      subject: classEntity.subject,
      preferredTutor: classEntity.tutor,
      preferredArea:
        classEntity.location || student.user.phone || 'Chưa cập nhật',
      preferredSchedule: classEntity.notes || 'Linh hoạt',
      requirements: `Đăng ký học lại với gia sư ${classEntity.tutor.user?.fullName || 'Gia sư'} từ lớp cũ (Mã lớp: CLASS-${classEntity.id.replace(/-/g, '').slice(0, 6).toUpperCase()})`,
      status: RequestStatus.MATCHED,
      proposedFee: classEntity.feePerSession,
      proposedSessions: classEntity.totalSessions || 24,
    });

    const savedRequest = await this.classRequestsRepository.save(classRequest);

    // Notify all Staff
    const staffUsers = await this.userRepository.find({
      relations: { role: true },
    });
    for (const staff of staffUsers) {
      if (staff.role?.name === 'staff') {
        await this.notificationsService.createNotification(
          staff.id,
          'Yêu cầu học lại từ lớp cũ',
          `Học viên ${student.user?.fullName} đã đăng ký học lại môn ${classEntity.subject?.name} với gia sư ${classEntity.tutor.user?.fullName}. Vui lòng duyệt tạo lớp học.`,
          NotificationType.NEW_REQUEST,
        );
      }
    }

    return savedRequest;
  }
}
