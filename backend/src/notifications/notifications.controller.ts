import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.notificationsService.getNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id || req.user.sub;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.id || req.user.sub;
    await this.notificationsService.markAllAsRead(userId);
    return { success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }
}
