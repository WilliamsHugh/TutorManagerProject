import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClassRequest, RequestStatus } from './entities/class-request.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { User } from '../users/entities/user.entity';
import { Tutor, ApprovalStatus } from '../users/entities/tutor.entity';
import { TutorSubject } from '../tutors/tutor-subject.entity';
import { CreateClassRequestDto } from './dto/create-class-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

type ClassRequestQuery = {
  status?: RequestStatus;
  search?: string;
};

@Injectable()
export class ClassRequestsService {
  constructor(
    @InjectRepository(ClassRequest)
    private readonly classRequestsRepository: Repository<ClassRequest>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectRepository(Tutor)
    private readonly tutorsRepository: Repository<Tutor>,
    @InjectRepository(TutorSubject)
    private readonly tutorSubjectsRepository: Repository<TutorSubject>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateClassRequestDto) {
    const student = await this.studentsRepository.findOne({
      where: { id: dto.studentId },
      relations: { user: true },
    });
    if (!student) throw new NotFoundException('Không tìm thấy học viên');

    const subject = await this.subjectsRepository.findOneBy({
      id: dto.subjectId,
    });
    if (!subject) throw new NotFoundException('Không tìm thấy môn học');

    let preferredTutor: Tutor | null = null;
    if (dto.preferredTutorId) {
      const tutor = await this.tutorsRepository.findOne({
        where: { id: dto.preferredTutorId },
        relations: { user: true },
      });
      if (tutor) {
        preferredTutor = tutor;
      }
    }

    const requirementLines: string[] = [];
    if (dto.requirements) requirementLines.push(dto.requirements);
    if (preferredTutor) {
      requirementLines.push(
        `[Học viên đề xuất gia sư: ${preferredTutor.user?.fullName || preferredTutor.id}]`,
      );
    }

    const request = this.classRequestsRepository.create({
      student,
      subject,
      preferredTutor: preferredTutor ?? undefined,
      preferredArea: dto.preferredArea,
      preferredSchedule: dto.preferredSchedule,
      requirements: requirementLines.join('\n') || undefined,
      status: preferredTutor ? RequestStatus.PROPOSED : RequestStatus.PENDING,
    });

    const savedRequest = await this.classRequestsRepository.save(request);

    // If tutor is proposed directly, notify them to submit proposal
    if (preferredTutor && preferredTutor.user?.id) {
      await this.notificationsService.createNotification(
        preferredTutor.user.id,
        'Yêu cầu ghép lớp từ Học viên',
        `Học viên ${student.user?.fullName || 'Ẩn danh'} đã chọn bạn làm gia sư môn ${subject.name || 'môn học'}. Vui lòng gửi đề xuất học phí.`,
        NotificationType.NEW_REQUEST,
      );
    }

    return savedRequest;
  }

  async findAll(query: ClassRequestQuery = {}) {
    const qb = this.classRequestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('request.subject', 'subject')
      .leftJoinAndSelect('request.preferredTutor', 'preferredTutor')
      .leftJoinAndSelect('preferredTutor.user', 'preferredTutorUser')
      .leftJoinAndSelect('request.handledBy', 'handledBy')
      .orderBy('request.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('request.status = :status', { status: query.status });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(studentUser.fullName ILIKE :search OR studentUser.phone ILIKE :search OR subject.name ILIKE :search OR request.preferredArea ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const request = await this.classRequestsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        subject: true,
        preferredTutor: { user: true },
        proposedTutors: { user: true },
        handledBy: true,
      },
    });
    if (!request)
      throw new NotFoundException('Không tìm thấy yêu cầu tìm gia sư');
    return request;
  }

  async updateStatus(id: string, status: RequestStatus, handledBy?: User) {
    const request = await this.findOne(id);
    request.status = status;
    if (handledBy) request.handledBy = handledBy;
    return this.classRequestsRepository.save(request);
  }

  async proposeTutors(id: string, tutorIds: string[]) {
    const request = await this.findOne(id);

    // Fetch tutors
    const tutors = await this.tutorsRepository.find({
      where: { id: In(tutorIds) },
      relations: { user: true },
    });

    request.proposedTutors = tutors;
    request.status = RequestStatus.PROCESSING;
    await this.classRequestsRepository.save(request);

    if (request.student?.user?.id) {
      await this.notificationsService.createNotification(
        request.student.user.id,
        'Trung tâm đề xuất gia sư mới',
        `Trung tâm đã gửi danh sách đề xuất ${tutors.length} gia sư cho yêu cầu dạy môn ${request.subject?.name || 'môn học'} của bạn.`,
        NotificationType.NEW_REQUEST,
      );
    }

    return { message: 'Đã gửi danh sách đề xuất gia sư thành công.' };
  }

  async getStudentRequests(studentUserId: string) {
    return this.classRequestsRepository.find({
      where: { student: { user: { id: studentUserId } } },
      relations: {
        subject: true,
        preferredTutor: { user: true },
        proposedTutors: { user: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async selectTutor(id: string, tutorId: string, studentUserId: string) {
    const request = await this.classRequestsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        subject: true,
        proposedTutors: { user: true },
      },
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (request.student?.user?.id !== studentUserId) {
      throw new BadRequestException(
        'Bạn không có quyền chọn gia sư cho yêu cầu này',
      );
    }

    const selectedTutor = request.proposedTutors.find((t) => t.id === tutorId);
    if (!selectedTutor) {
      throw new BadRequestException(
        'Gia sư này không nằm trong danh sách đề xuất của trung tâm',
      );
    }

    request.preferredTutor = selectedTutor;
    request.status = RequestStatus.PROPOSED;
    await this.classRequestsRepository.save(request);

    // Notify the tutor
    if (selectedTutor.user?.id) {
      await this.notificationsService.createNotification(
        selectedTutor.user.id,
        'Yêu cầu ghép lớp từ Học viên',
        `Học viên ${request.student?.user?.fullName || 'Ẩn danh'} đã chọn bạn làm gia sư môn ${request.subject?.name || 'môn học'}. Vui lòng gửi đề xuất học phí.`,
        NotificationType.NEW_REQUEST,
      );
    }

    return { message: 'Chọn gia sư thành công. Đã gửi thông báo cho gia sư.' };
  }

  async getPublicClassRequests(params: {
    search?: string;
    subject?: string;
    mode?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search = '',
      subject = '',
      mode = '',
      page = 1,
      limit = 12,
    } = params;

    const qb = this.classRequestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('request.subject', 'subject')
      .where('request.status = :status', { status: RequestStatus.PENDING });

    const searchTrimmed = search.trim();
    if (searchTrimmed) {
      qb.andWhere(
        '(studentUser.fullName ILIKE :search OR subject.name ILIKE :search OR request.preferredArea ILIKE :search)',
        { search: `%${searchTrimmed}%` },
      );
    }

    if (subject) {
      const subjectNames = subject.split(',');
      qb.andWhere('subject.name IN (:...subjectNames)', { subjectNames });
    }

    if (mode) {
      if (mode?.toLowerCase()?.includes('online')) {
        qb.andWhere('request.preferredArea ILIKE :mode', { mode: '%online%' });
      } else if (mode?.toLowerCase()?.includes('offline')) {
        qb.andWhere('request.preferredArea NOT ILIKE :mode', { mode: '%online%' });
      }
    }

    qb.orderBy('request.createdAt', 'DESC');

    const [requests, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = requests.map((req) => ({
      id: req.id,
      subject: req.subject?.name || 'Môn học mới',
      location: req.preferredArea || 'Toàn quốc',
      schedule: req.preferredSchedule || 'Linh hoạt',
      requirements: req.requirements || '',
      studentName: req.student?.user?.fullName || 'Ẩn danh',
      gradeLevel: req.student?.gradeLevel || 'Mọi cấp độ',
      status: req.status,
      createdAt: req.createdAt,
    }));

    return {
      data,
      meta: { total, page, limit },
    };
  }

  async recommendTutors(id: string) {
    const request = await this.findOne(id);
    if (!request.subject?.id) {
      throw new BadRequestException('Yêu cầu chưa có môn học để gợi ý gia sư');
    }

    const tutorSubjects = await this.tutorSubjectsRepository.find({
      where: {
        subject: { id: request.subject.id },
        tutor: { approvalStatus: ApprovalStatus.APPROVED },
      },
      relations: {
        tutor: { user: true },
        subject: true,
      },
    });

    const area = request.preferredArea?.toLowerCase() ?? '';

    return tutorSubjects.map((item) => {
      const availableAreas = item.tutor.availableAreas?.toLowerCase() ?? '';
      const areaMatched = Boolean(area && availableAreas.includes(area));
      const score =
        70 + (areaMatched ? 20 : 0) + Math.min(item.yearsExperience ?? 0, 10);

      return {
        tutor: item.tutor,
        subject: item.subject,
        proficiencyLevel: item.proficiencyLevel,
        yearsExperience: item.yearsExperience,
        score,
        areaMatched,
      };
    });
  }
}
