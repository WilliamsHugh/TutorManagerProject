import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class, ClassStatus } from './entities/class.entity';
import { ClassRequest, RequestStatus } from './entities/class-request.entity';
import { Schedule } from './entities/schedule.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

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
          const allDayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
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

    return savedClass;
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
      },
    });
    if (!classEntity) throw new NotFoundException('Không tìm thấy lớp học');
    return classEntity;
  }

  async updateStatus(id: string, status: ClassStatus) {
    const classEntity = await this.findOne(id);
    classEntity.status = status;
    return this.classesRepository.save(classEntity);
  }

  async findStudentClasses(userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên tương ứng với tài khoản này');
    }

    return this.classesRepository.find({
      where: { student: { id: student.id } },
      relations: {
        tutor: { user: true },
        subject: true,
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    const student = await this.studentsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy học viên tương ứng với tài khoản này');
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
      throw new ConflictException('Bạn không thuộc lớp học này để thực hiện đánh giá');
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
        class: { tutor: { id: tutorId }, status: ClassStatus.ACTIVE }
      },
      relations: ['class', 'class.subject', 'class.student', 'class.student.user'],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC'
      }
    });
  }

  async getStudentSchedules(studentId: string) {
    return this.scheduleRepository.find({
      where: {
        class: { student: { id: studentId }, status: ClassStatus.ACTIVE }
      },
      relations: ['class', 'class.subject', 'class.tutor', 'class.tutor.user'],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC'
      }
    });
  }

  async getClassSchedules(classId: string) {
    return this.scheduleRepository.find({
      where: {
        class: { id: classId }
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
    const classEntity = await this.classesRepository.findOne({ where: { id: classId } });
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

    return this.scheduleRepository.save(schedule);
  }

  async updateSchedule(classId: string, scheduleId: string, dto: UpdateScheduleDto) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, class: { id: classId } },
    });
    if (!schedule) throw new NotFoundException('Không tìm thấy buổi học tương ứng trong lớp này');

    if (dto.dayOfWeek !== undefined) schedule.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime !== undefined) schedule.startTime = dto.startTime;
    if (dto.endTime !== undefined) schedule.endTime = dto.endTime;
    if (dto.sessionDate !== undefined) schedule.sessionDate = dto.sessionDate ? new Date(dto.sessionDate) : null as any;
    if (dto.sessionStatus !== undefined) schedule.sessionStatus = dto.sessionStatus;
    if (dto.note !== undefined) schedule.note = dto.note;

    return this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(classId: string, scheduleId: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, class: { id: classId } },
    });
    if (!schedule) throw new NotFoundException('Không tìm thấy buổi học tương ứng trong lớp này');

    await this.scheduleRepository.remove(schedule);
    return { success: true };
  }
}
