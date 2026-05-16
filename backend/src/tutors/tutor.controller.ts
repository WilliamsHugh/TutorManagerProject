// backend/src/tutors/tutor.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Bảo mật bằng JWT
import { ClassesService } from '../classes/classes.service';
import { CreateLearningReportDto } from '../classes/create-report.dto';

@Controller('tutor')
@UseGuards(JwtAuthGuard) // Kích hoạt lại bảo mật JWT
export class TutorController {
  constructor(private readonly classesService: ClassesService) {}

  // Lấy dữ liệu tổng quan cho Dashboard từ Database
  @Get('dashboard')
  async getDashboard(@Request() req, @Query('date') date?: string) {
    // Đảm bảo lấy đúng ID từ payload JWT (trường sub hoặc id)
    const tutorId = req.user.id || req.user.sub;
    if (!tutorId) console.error('Dashboard Error: User ID not found in request');
    return this.classesService.getTutorDashboard(tutorId, date);
  }

  // Lấy lịch dạy cá nhân (TUTOR_QĐ2)
  @Get('schedule')
  async getMySchedule(@Request() req, @Query('date') date?: string) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.findScheduleByTutor(tutorId, date);
  }

  // Lấy danh sách học viên của tôi
  @Get('students')
  async getMyStudents(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.getTutorStudents(tutorId);
  }

  // Xem danh sách lớp mới chờ gia sư (TUTOR_QĐ1)
  @Get('new-classes')
  async getNewClasses(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.getAvailableClasses(tutorId);
  }

  // Xem chi tiết một yêu cầu lớp học (Suggested Class Detail)
  @Get('class-requests/:id')
  async getClassRequestDetail(@Param('id') id: string) {
    return this.classesService.getClassRequestDetail(id);
  }

  // Chấp nhận nhận lớp học
  @Post('class-requests/:id/accept')
  async acceptClass(@Param('id') id: string, @Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.acceptClassRequest(id, tutorId);
  }

  // Lấy danh sách thông báo của gia sư
  @Get('notifications')
  async getNotifications(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.getNotifications(tutorId);
  }

  // Cập nhật hồ sơ chuyên môn
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.updateTutorProfile(tutorId, updateData);
  }

  @Get('classes/:classId/reports')
  async getClassReports(@Param('classId') classId: string, @Request() req) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.classesService.getReportsByClass(classId, tutorId);
  }

  // Nộp báo cáo buổi học (TUTOR_BM2)
  @Post('report')
  async submitReport(@Request() req, @Body() dto: CreateLearningReportDto) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.classesService.createReport(tutorId, dto);
  }

  @Patch('reports/:id')
  async updateReport(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateLearningReportDto>) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.classesService.updateReport(id, tutorId, dto);
  }

  @Delete('reports/:id')
  async deleteReport(@Param('id') id: string, @Request() req) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.classesService.deleteReport(id, tutorId);
  }

  // API Endpoint sinh dữ liệu mẫu
  @Post('seed')
  async seedData() {
    return this.classesService.seedMockData();
  }
}