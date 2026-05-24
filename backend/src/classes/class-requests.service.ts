import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRequest, RequestStatus } from './class-request.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { User } from '../users/entities/user.entity';
import { Tutor, ApprovalStatus } from '../users/entities/tutor.entity';
import { TutorSubject } from '../tutors/tutor-subject.entity';
import { CreateClassRequestDto } from './dto/create-class-request.dto';

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
  ) {}

  async create(dto: CreateClassRequestDto) {
    const student = await this.studentsRepository.findOne({
      where: { id: dto.studentId },
      relations: { user: true },
    });
    if (!student) throw new NotFoundException('Không tìm thấy học viên');

    const subject = await this.subjectsRepository.findOneBy({ id: dto.subjectId });
    if (!subject) throw new NotFoundException('Không tìm thấy môn học');

    const request = this.classRequestsRepository.create({
      student,
      subject,
      preferredArea: dto.preferredArea,
      preferredSchedule: dto.preferredSchedule,
      requirements: dto.requirements,
      status: RequestStatus.PENDING,
    });

    return this.classRequestsRepository.save(request);
  }

  async findAll(query: ClassRequestQuery = {}) {
    const qb = this.classRequestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('request.subject', 'subject')
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
        handledBy: true,
      },
    });
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu tìm gia sư');
    return request;
  }

  async updateStatus(id: string, status: RequestStatus, handledBy?: User) {
    const request = await this.findOne(id);
    request.status = status;
    if (handledBy) request.handledBy = handledBy;
    return this.classRequestsRepository.save(request);
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
      const score = 70 + (areaMatched ? 20 : 0) + Math.min(item.yearsExperience ?? 0, 10);

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
