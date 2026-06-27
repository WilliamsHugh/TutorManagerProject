import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, RoleType } from '../auth/decorators/roles.decorator';
import { ClassStatus } from './entities/class.entity';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassStatusDto } from './dto/update-class-status.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  create(@Body() dto: CreateClassDto, @Request() req) {
    return this.classesService.create(dto, req.user);
  }

  @Get()
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  findAll(@Query('status') status?: ClassStatus) {
    return this.classesService.findAll({ status });
  }

  // Student: xem danh sách đề xuất từ gia sư đang chờ xác nhận
  @Get('student/proposals')
  @Roles(RoleType.STUDENT)
  async getProposals(@Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.getStudentProposals(userId);
  }

  // Student: xác nhận đề xuất từ gia sư → tạo lớp
  @Post('student/confirm-proposal/:requestId')
  @Roles(RoleType.STUDENT)
  async confirmProposal(@Param('requestId') requestId: string, @Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.confirmProposal(requestId, userId);
  }

  // Student: từ chối đề xuất từ gia sư
  @Post('student/decline-proposal/:requestId')
  @Roles(RoleType.STUDENT)
  async declineProposal(@Param('requestId') requestId: string, @Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.declineProposal(requestId, userId);
  }

  // Student: yêu cầu gia sư điều chỉnh đề xuất
  @Post('student/counter-proposal/:requestId')
  @Roles(RoleType.STUDENT)
  async counterProposal(
    @Param('requestId') requestId: string,
    @Body('note') note: string,
    @Request() req,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.counterProposal(requestId, userId, note);
  }

  // Student: yêu cầu hủy lớp học
  @Post('student/request-cancellation/:classId')
  @Roles(RoleType.STUDENT)
  async requestCancellation(
    @Param('classId') classId: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.requestClassCancellation(classId, userId, 'student', reason);
  }

  // Student: phản hồi yêu cầu hủy lớp (đồng ý/từ chối)
  @Post('student/respond-cancellation/:classId')
  @Roles(RoleType.STUDENT)
  async respondCancellation(
    @Param('classId') classId: string,
    @Body('agree') agree: boolean,
    @Request() req,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.respondToCancellation(classId, userId, 'student', agree);
  }

  // Student: xem thông tin hủy lớp
  @Get('student/cancellation/:classId')
  @Roles(RoleType.STUDENT)
  async getClassCancellation(@Param('classId') classId: string, @Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.getClassCancellationInfo(classId, userId, 'student');
  }

  @Get('student/my-classes')
  @Roles(RoleType.STUDENT)
  findMyClasses(@Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.findStudentClasses(userId);
  }

  @Get('my-schedule')
  @Roles(RoleType.STUDENT)
  findMySchedule(@Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.findStudentSchedule(userId);
  }

  @Get('student/reports/:classId')
  @Roles(RoleType.STUDENT)
  findMyClassReports(@Param('classId') classId: string, @Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.getStudentClassReports(userId, classId);
  }

  @Get('student/schedule-report/:classId/:sessionDate')
  @Roles(RoleType.STUDENT)
  findScheduleReport(
    @Param('classId') classId: string,
    @Param('sessionDate') sessionDate: string,
    @Request() req,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.getStudentScheduleReport(userId, classId, sessionDate);
  }

  @Get(':id')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/schedule')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  getClassSchedule(@Param('id') id: string) {
    return this.classesService.getClassSchedules(id);
  }

  @Patch(':id/status')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateClassStatusDto) {
    return this.classesService.updateStatus(id, dto.status);
  }

  @Get('tutor/:id/schedule')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  getTutorSchedule(@Param('id') id: string) {
    return this.classesService.getTutorSchedules(id);
  }

  @Get('student/:id/schedule')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  getStudentSchedule(@Param('id') id: string) {
    return this.classesService.getStudentSchedules(id);
  }

  @Post(':classId/schedules')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  addSchedule(
    @Param('classId') classId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.classesService.createSchedule(classId, dto);
  }

  @Patch(':classId/schedules/:scheduleId')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  updateSchedule(
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.classesService.updateSchedule(classId, scheduleId, dto);
  }

  @Delete(':classId/schedules/:scheduleId')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  deleteSchedule(
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.classesService.deleteSchedule(classId, scheduleId);
  }
}
