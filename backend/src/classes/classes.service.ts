import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class, ClassStatus } from './entities/class.entity';
import { ClassRequest, RequestStatus } from './entities/class-request.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateReviewDto } from './dto/create-review.dto';

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
  ) {}

  async create(dto: CreateClassDto, createdBy?: User) {
    const request = await this.classRequestsRepository.findOne({
      where: { id: dto.requestId },
      relations: {
        student: true,
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
      .orderBy('class.startDate', 'DESC');

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
}
