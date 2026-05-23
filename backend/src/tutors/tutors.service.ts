import { Injectable } from '@nestjs/common';
import { CreateLearningReportDto } from '../reports/dto/create-report.dto';

@Injectable()
export class TutorsService {
  constructor() {}

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

  async getPublicTutors(params: {
    search?: string;
    subject?: string;
    page?: number;
    limit?: number;
  }) {
    // Stub: kết nối DB khi entity Tutor có sẵn
    // Hiện trả về mảng rỗng — seed sẽ cung cấp dữ liệu qua DB thật
    const { search = '', subject = '', page = 1, limit = 12 } = params;
    return {
      data: [],
      meta: { total: 0, page, limit },
    };
  }
}
