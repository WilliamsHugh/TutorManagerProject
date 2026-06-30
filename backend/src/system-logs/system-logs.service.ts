import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from './system-log.entity';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
  ) {}

  async create(data: {
    userId?: string | null;
    action: string;
    method?: string | null;
    route?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    details?: any;
  }): Promise<SystemLog> {
    const log = this.systemLogRepository.create({
      userId: data.userId || null,
      action: data.action,
      method: data.method || null,
      route: data.route || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      details: data.details || null,
    });
    return this.systemLogRepository.save(log);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const qb = this.systemLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('log.createdAt', 'DESC');

    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }

    if (query.search) {
      qb.andWhere(
        '(log.action ILIKE :search OR log.route ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.fromDate) {
      qb.andWhere('log.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }

    if (query.toDate) {
      const endOfDay = new Date(query.toDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('log.createdAt <= :toDate', { toDate: endOfDay });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
