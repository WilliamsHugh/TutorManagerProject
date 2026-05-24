import {
  Body,
  Controller,
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
import { RequestStatus } from './entities/class-request.entity';
import { ClassRequestsService } from './class-requests.service';
import { CreateClassRequestDto } from './dto/create-class-request.dto';
import { UpdateClassRequestStatusDto } from './dto/update-class-request-status.dto';

@Controller('class-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassRequestsController {
  constructor(private readonly classRequestsService: ClassRequestsService) {}

  @Post()
  @Roles(RoleType.STUDENT, RoleType.STAFF, RoleType.ADMIN)
  create(@Body() dto: CreateClassRequestDto) {
    return this.classRequestsService.create(dto);
  }

  @Get()
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  findAll(
    @Query('status') status?: RequestStatus,
    @Query('search') search?: string,
  ) {
    return this.classRequestsService.findAll({ status, search });
  }

  @Get(':id')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.classRequestsService.findOne(id);
  }

  @Get(':id/tutor-recommendations')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  recommendTutors(@Param('id') id: string) {
    return this.classRequestsService.recommendTutors(id);
  }

  @Patch(':id/status')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateClassRequestStatusDto,
    @Request() req,
  ) {
    return this.classRequestsService.updateStatus(id, dto.status, req.user);
  }
}
