import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  async findAll(): Promise<Setting[]> {
    return this.settingsRepository.find({ order: { key: 'ASC' } });
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.settingsRepository.findOneBy({ key });
  }

  async getValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.settingsRepository.findOneBy({ key });
    return setting?.value ?? defaultValue;
  }

  async getNumberValue(key: string, defaultValue?: number): Promise<number | undefined> {
    const setting = await this.settingsRepository.findOneBy({ key });
    if (!setting) return defaultValue;
    const num = Number(setting.value);
    return isNaN(num) ? defaultValue : num;
  }

  async upsert(key: string, data: Partial<Setting>): Promise<Setting> {
    const existing = await this.settingsRepository.findOneBy({ key });
    if (existing) {
      if (data.value !== undefined) existing.value = data.value;
      if (data.label !== undefined) existing.label = data.label;
      if (data.type !== undefined) existing.type = data.type;
      if (data.options !== undefined) existing.options = data.options;
      if (data.description !== undefined) existing.description = data.description;
      return this.settingsRepository.save(existing);
    }
    return this.settingsRepository.save(
      this.settingsRepository.create({
        key,
        value: data.value || '',
        label: data.label || key,
        type: data.type || 'text',
        options: data.options,
        description: data.description,
      }),
    );
  }

  async update(key: string, value: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOneBy({ key });
    if (!setting) throw new NotFoundException(`Không tìm thấy cấu hình '${key}'`);
    setting.value = value;
    return this.settingsRepository.save(setting);
  }

  async remove(key: string): Promise<void> {
    const result = await this.settingsRepository.delete({ key });
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy cấu hình '${key}'`);
    }
  }

  // Seed default settings if not exist
  async seedDefaults(): Promise<void> {
    const defaults = [
      {
        key: 'tuition_per_hour',
        value: '200000',
        label: 'Học phí mỗi buổi (VNĐ)',
        type: 'number',
        description: 'Mức học phí mặc định cho mỗi buổi học (VNĐ)',
      },
      {
        key: 'min_sessions',
        value: '5',
        label: 'Số buổi tối thiểu',
        type: 'number',
        description: 'Số buổi học tối thiểu cho mỗi lớp',
      },
      {
        key: 'max_sessions',
        value: '50',
        label: 'Số buổi tối đa',
        type: 'number',
        description: 'Số buổi học tối đa cho mỗi lớp',
      },
      {
        key: 'max_classes_per_tutor',
        value: '10',
        label: 'Số lớp tối đa/gia sư',
        type: 'number',
        description: 'Số lớp tối đa một gia sư có thể dạy cùng lúc',
      },
      {
        key: 'schedule_overlap_minutes',
        value: '30',
        label: 'Khoảng cách tối thiểu giữa các buổi (phút)',
        type: 'number',
        description: 'Khoảng thời gian tối thiểu giữa 2 buổi học của cùng gia sư hoặc học viên',
      },
      {
        key: 'max_students_per_class',
        value: '1',
        label: 'Số học viên tối đa/lớp',
        type: 'number',
        description: 'Số học viên tối đa trong một lớp học (1 = kèm 1-1)',
      },
      {
        key: 'auto_approve_tutor',
        value: 'false',
        label: 'Tự động duyệt gia sư',
        type: 'select',
        options: JSON.stringify([
          { label: 'Không', value: 'false' },
          { label: 'Có', value: 'true' },
        ]),
        description: 'Tự động phê duyệt hồ sơ gia sư mới mà không cần admin duyệt',
      },
      {
        key: 'enable_student_review',
        value: 'true',
        label: 'Cho phép đánh giá gia sư',
        type: 'select',
        options: JSON.stringify([
          { label: 'Không', value: 'false' },
          { label: 'Có', value: 'true' },
        ]),
        description: 'Cho phép học viên đánh giá gia sư sau khi hoàn thành khóa học',
      },
    ];

    for (const d of defaults) {
      await this.upsert(d.key, d);
    }
  }
}
