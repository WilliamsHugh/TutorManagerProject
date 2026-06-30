import { Controller, Get, Query } from '@nestjs/common';
import { TutorsService } from './tutors.service';

/**
 * Public endpoint — không yêu cầu xác thực JWT.
 * Dùng cho trang /tutors (listing công khai) trên frontend.
 */
@Controller('tutors')
export class PublicTutorController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get()
  async getPublicTutors(
    @Query('search') search?: string,
    @Query('subject') subject?: string,
    @Query('province') province?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.tutorsService.getPublicTutors({
      search,
      subject,
      province,
      page: +page,
      limit: +limit,
    });
  }
}
