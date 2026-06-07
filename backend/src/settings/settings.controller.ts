import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, RoleType } from '../auth/decorators/roles.decorator';
import { Setting } from './setting.entity';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll(): Promise<Setting[]> {
    return this.settingsService.findAll();
  }

  @Get(':key')
  async findOne(@Param('key') key: string): Promise<Setting> {
    const setting = await this.settingsService.findByKey(key);
    if (!setting) {
      const { NotFoundException } = require('@nestjs/common');
      throw new NotFoundException(`Không tìm thấy cấu hình '${key}'`);
    }
    return setting;
  }

  @Put(':key')
  async update(
    @Param('key') key: string,
    @Body() body: { value: string },
  ): Promise<Setting> {
    return this.settingsService.update(key, body.value);
  }

  @Post('seed')
  async seed(): Promise<{ message: string }> {
    await this.settingsService.seedDefaults();
    return { message: 'Đã khởi tạo cấu hình mặc định thành công' };
  }

  @Delete(':key')
  async remove(@Param('key') key: string): Promise<{ message: string }> {
    await this.settingsService.remove(key);
    return { message: `Đã xóa cấu hình '${key}'` };
  }
}
