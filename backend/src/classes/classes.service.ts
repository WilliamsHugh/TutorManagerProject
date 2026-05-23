import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class, ClassStatus } from './class.entity';
import { ClassRequest, RequestStatus } from './class-request.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { User } from '../users/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateLearningReportDto } from './create-report.dto';

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
  ) {}

  async create(dto: CreateClassDto, createdBy?: User) {
    const request = await this.classRequestsRepository.findOne({
      where: { id: dto.requestId },
      relations: {
        student: true,
        subject: true,
      },
    });
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu tìm gia sư');

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

  // --- Stubs for methods called by TutorController ---
  async getTutorDashboard(tutorId: string, date?: string) {
    return {};
  }

  async findScheduleByTutor(tutorId: string, date?: string, view?: string) {
    return [];
  }

  async getTutorStudents(tutorId: string) {
    return [];
  }

  async getAvailableClasses(tutorId: string) {
    return {
      classes: [
        {
          id: 1,
          code: "#LH1023",
          title: "Tìm gia sư Tiếng Anh giao tiếp",
          mode: "Online",
          levelTag: "Người đi làm",
          salary: "300,000đ - 350,000đ",
          location: "Hà Nội",
          studentInfo: "Sinh viên ngôn ngữ Anh hoặc có kinh nghiệm sư phạm, IELTS 7.0+",
          postedAt: "Đăng 2 giờ trước",
        },
        {
          id: 2,
          code: "#LH1024",
          title: "Toán lớp 12 - Luyện thi Đại học",
          mode: "Offline",
          levelTag: "Lớp 12",
          salary: "250,000đ",
          location: "Quận Cầu Giấy, Hà Nội",
          studentInfo: "3 buổi/tuần (Thứ 2, 4, 6)",
          postedAt: "Đăng 5 giờ trước",
        },
        {
          id: 3,
          code: "#LH1025",
          title: "Rèn chữ đẹp cho bé chuẩn bị vào lớp 1",
          mode: "Offline",
          levelTag: "Mầm non",
          salary: "150,000đ",
          location: "Quận Đống Đa, Hà Nội",
          studentInfo: "Gia sư nữ, nhẹ nhàng, kiên nhẫn với trẻ em.",
          postedAt: "Đăng hôm qua",
        },
      ],
      profile: {
        name: "Mock Tutor",
        avatar: "https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FSoutheast%20Asian%2F2",
      }
    };
  }

  async getClassRequestDetail(id: string) {
    return {};
  }

  async acceptClassRequest(id: string, tutorId: string) {
    return {};
  }

  async getNotifications(tutorId: string) {
    return [];
  }

  async updateTutorProfile(tutorId: string, updateData: any) {
    return {};
  }

  async getReportsByClass(classId: string, tutorId: string) {
    return [];
  }

  async createReport(tutorId: string, dto: CreateLearningReportDto) {
    return {};
  }

  async updateReport(id: string, tutorId: string, dto: Partial<CreateLearningReportDto>) {
    return {};
  }

  async deleteReport(id: string, tutorId: string) {
    return {};
  }

  async seedMockData() {
    return { message: 'Mock data seeded' };
  }
}
