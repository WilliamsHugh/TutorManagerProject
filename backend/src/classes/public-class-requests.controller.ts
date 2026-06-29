import { Controller, Get, Query } from '@nestjs/common';
import { ClassRequestsService } from './class-requests.service';

/**
 * Public endpoint — không yêu cầu xác thực JWT.
 * Dùng cho trang /classes (listing công khai) trên frontend.
 */
@Controller('public/class-requests')
export class PublicClassRequestsController {
  constructor(private readonly classRequestsService: ClassRequestsService) {}

  @Get()
  async getPublicClassRequests(
    @Query('search') search?: string,
    @Query('subject') subject?: string,
    @Query('mode') mode?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.classRequestsService.getPublicClassRequests({
      search,
      subject,
      mode,
      page: +page,
      limit: +limit,
    });
  }
}
