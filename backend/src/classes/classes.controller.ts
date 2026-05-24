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
import { ClassStatus } from './entities/class.entity';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassStatusDto } from './dto/update-class-status.dto';

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

  @Get(':id')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(RoleType.STAFF, RoleType.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateClassStatusDto) {
    return this.classesService.updateStatus(id, dto.status);
  }
}
