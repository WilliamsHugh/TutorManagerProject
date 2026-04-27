// backend/src/tutors/tutor.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Bảo mật bằng JWT
import { ClassesService } from '../classes/classes.service';
import { CreateLearningReportDto } from '../classes/create-report.dto';

@Controller('tutor')
@UseGuards(JwtAuthGuard) // Áp dụng bảo mật cho toàn bộ controller
export class TutorController {
  constructor(private readonly classesService: ClassesService) {}

  // Lấy dữ liệu tổng quan cho Dashboard từ Database
  @Get('dashboard')
  async getDashboard(@Request() req) {
    const tutorId = req.user.id; // Lấy ID từ token đăng nhập
    return this.classesService.getTutorDashboard(tutorId);
  }

  // Lấy lịch dạy cá nhân (TUTOR_QĐ2)
  @Get('schedule')
  async getMySchedule(@Request() req) {
    const tutorId = req.user.id; // Lấy ID từ token đăng nhập
    return this.classesService.findScheduleByTutor(tutorId);
  }

  // Nộp báo cáo buổi học (TUTOR_BM2)
  @Post('report')
  async submitReport(@Request() req, @Body() dto: CreateLearningReportDto) {
    const tutorId = req.user.id;
    return this.classesService.createReport(tutorId, dto);
  }
}