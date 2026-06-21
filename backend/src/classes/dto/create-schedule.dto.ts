import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SessionStatus } from '../entities/schedule.entity';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  dayOfWeek!: string; // 'T2', 'T3', 'CN', etc.

  @IsNotEmpty()
  @IsString()
  startTime!: string; // 'HH:MM' or 'HH:MM:SS'

  @IsNotEmpty()
  @IsString()
  endTime!: string; // 'HH:MM' or 'HH:MM:SS'

  @IsOptional()
  @IsString()
  sessionDate?: string; // 'YYYY-MM-DD'

  @IsOptional()
  @IsEnum(SessionStatus)
  sessionStatus?: SessionStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
