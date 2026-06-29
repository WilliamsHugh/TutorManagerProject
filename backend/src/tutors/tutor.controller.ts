import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Bảo mật bằng JWT
import { TutorsService } from './tutors.service';
import { ClassesService } from '../classes/classes.service';
import { CreateLearningReportDto } from '../classes/dto/create-learning-report.dto';

@Controller('tutor')
@UseGuards(JwtAuthGuard) // Kích hoạt lại bảo mật JWT
export class TutorController {
  constructor(
    private readonly tutorsService: TutorsService,
    private readonly classesService: ClassesService,
  ) {}

  // Lấy hồ sơ chi tiết của gia sư
  @Get('profile')
  async getProfile(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return { profile: await this.tutorsService.getTutorProfileData(tutorId) };
  }

  // Lấy danh sách môn học của gia sư
  @Get('subjects')
  async getSubjects(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.getTutorSubjects(tutorId);
  }

  // Cập nhật danh sách môn học của gia sư
  @Put('subjects')
  async updateSubjects(@Request() req, @Body('subjects') subjects: string[]) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.updateTutorSubjects(tutorId, subjects);
  }

  // Lấy dữ liệu tổng quan cho Dashboard từ Database
  @Get('dashboard')
  async getDashboard(@Request() req, @Query('date') date?: string) {
    // Đảm bảo lấy đúng ID từ payload JWT (trường sub hoặc id)
    const tutorId = req.user.id || req.user.sub;
    if (!tutorId)
      console.error('Dashboard Error: User ID not found in request');
    return this.tutorsService.getTutorDashboard(tutorId, date);
  }

  // Lấy lịch dạy cá nhân (TUTOR_QĐ2)
  @Get('schedule')
  async getMySchedule(
    @Request() req,
    @Query('date') date?: string,
    @Query('view') view?: string,
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.findScheduleByTutor(tutorId, date, view);
  }

  // Đăng ký lịch nghỉ học cho gia sư (theo khoảng thời gian)
  @Post('schedule/leave')
  async createLeaveSchedule(
    @Request() req,
    @Body()
    body: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      note: string;
    },
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.createLeaveSchedule(tutorId, body);
  }

  // Hủy lịch nghỉ (phục hồi lại lịch dạy bình thường cho một buổi học cụ thể)
  @Delete('schedule/leave/:id')
  async cancelLeaveSchedule(@Param('id') id: string, @Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.cancelLeaveSchedule(tutorId, id);
  }

  // Hủy hàng loạt lịch nghỉ theo khoảng thời gian
  @Post('schedule/cancel-leave-range')
  async cancelLeaveScheduleRange(
    @Request() req,
    @Body() data: { startDate: string; endDate: string },
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.cancelLeaveScheduleRange(tutorId, data);
  }

  // Lấy danh sách học viên của tôi
  @Get('students')
  async getMyStudents(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.getTutorStudents(tutorId);
  }

  // Xem danh sách lớp mới chờ gia sư (TUTOR_QĐ1)
  @Get('new-classes')
  async getNewClasses(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.getAvailableClasses(tutorId);
  }

  // Xem chi tiết một yêu cầu lớp học (Suggested Class Detail)
  @Get('class-requests/:id')
  async getClassRequestDetail(@Param('id') id: string) {
    return this.tutorsService.getClassRequestDetail(id);
  }

  // Chấp nhận nhận lớp học
  @Post('class-requests/:id/accept')
  async acceptClass(@Param('id') id: string, @Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.acceptClassRequest(id, tutorId);
  }

  // Lấy danh sách thông báo của gia sư
  @Get('notifications')
  async getNotifications(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.getNotifications(tutorId);
  }

  // Đánh dấu tất cả thông báo đã đọc
  @Patch('notifications/read-all')
  async markAllNotificationsRead(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.markAllNotificationsRead(tutorId);
  }

  // Cập nhật hồ sơ chuyên môn
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.updateTutorProfile(tutorId, updateData);
  }

  @Get('classes/:classId/reports')
  async getClassReports(@Param('classId') classId: string, @Request() req) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.tutorsService.getReportsByClass(classId, tutorId);
  }

  // Nộp báo cáo buổi học (TUTOR_BM2)
  @Post('report')
  async submitReport(@Request() req, @Body() dto: CreateLearningReportDto) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.tutorsService.createReport(tutorId, dto);
  }

  @Patch('reports/:id')
  async updateReport(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: Partial<CreateLearningReportDto>,
  ) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.tutorsService.updateReport(id, tutorId, dto);
  }

  @Delete('reports/:id')
  async deleteReport(@Param('id') id: string, @Request() req) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.tutorsService.deleteReport(id, tutorId);
  }

  // Lấy báo cáo thu nhập của gia sư
  @Get('earnings')
  async getEarnings(@Request() req) {
    const tutorId = req.user?.sub || req.user?.id;
    return this.tutorsService.getTutorEarnings(tutorId);
  }

  // Lấy danh sách đề xuất từ học sinh
  @Get('recommendations')
  async getRecommendations(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.getTutorRecommendations(tutorId);
  }

  // Lấy danh sách đề xuất đang chờ (PROPOSED + NEGOTIATING)
  @Get('recommendations/pending')
  async getPendingRecommendations(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.getTutorPendingProposals(tutorId);
  }

  // Gửi đề xuất học phí & số buổi cho học sinh
  @Post('recommendations/:id/propose')
  async proposeRecommendation(
    @Param('id') id: string,
    @Body() body: { feePerSession: number; totalSessions: number },
    @Request() req,
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.proposeRecommendation(
      id,
      tutorId,
      body.feePerSession,
      body.totalSessions,
    );
  }

  // Từ chối đề xuất từ học sinh
  @Post('recommendations/:id/decline')
  async declineRecommendation(@Param('id') id: string, @Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.declineRecommendation(id, tutorId);
  }

  // Điều chỉnh đề xuất (khi học sinh yêu cầu sửa)
  @Post('recommendations/:id/modify')
  async modifyProposal(
    @Param('id') id: string,
    @Body() body: { feePerSession: number; totalSessions: number },
    @Request() req,
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.modifyProposal(
      id,
      tutorId,
      body.feePerSession,
      body.totalSessions,
    );
  }

  // Rút đề xuất
  @Post('recommendations/:id/withdraw')
  async withdrawProposal(@Param('id') id: string, @Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.tutorsService.withdrawProposal(id, tutorId);
  }

  // Gia sư yêu cầu hủy lớp học
  @Post('classes/:classId/request-cancellation')
  async requestCancellation(
    @Param('classId') classId: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.requestClassCancellation(classId, tutorId, 'tutor', reason);
  }

  // Gia sư phản hồi yêu cầu hủy lớp
  @Post('classes/:classId/respond-cancellation')
  async respondCancellation(
    @Param('classId') classId: string,
    @Body('agree') agree: boolean,
    @Request() req,
  ) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.respondToCancellation(classId, tutorId, 'tutor', agree);
  }

  // Gia sư xem thông tin hủy lớp
  @Get('classes/:classId/cancellation')
  async getClassCancellation(@Param('classId') classId: string, @Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.getClassCancellationInfo(classId, tutorId, 'tutor');
  }

  // Gia sư lấy danh sách lớp có yêu cầu hủy
  @Get('classes/cancellations')
  async getCancellations(@Request() req) {
    const tutorId = req.user.id || req.user.sub;
    return this.classesService.getTutorCancellations(tutorId);
  }

  // API Endpoint sinh dữ liệu mẫu
  @Post('seed')
  async seedData() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Cannot seed in production');
    }
    return this.tutorsService.seedMockData();
  }
}
