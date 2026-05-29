import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, RoleType } from '../auth/decorators/roles.decorator';
import { ClassesService } from './classes.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(RoleType.STUDENT)
  create(@Body() dto: CreateReviewDto, @Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.createReview(userId, dto);
  }

  @Get('student')
  @Roles(RoleType.STUDENT)
  findMyReviews(@Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.classesService.getReviewsByStudent(userId);
  }

  @Get('tutor/:tutorId')
  findByTutor(@Param('tutorId') tutorId: string) {
    return this.classesService.getReviewsByTutor(tutorId);
  }

  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.classesService.getClassReview(classId);
  }
}
