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
