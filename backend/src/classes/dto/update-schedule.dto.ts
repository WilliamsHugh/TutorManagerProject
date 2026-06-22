import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionStatus } from '../entities/schedule.entity';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  sessionDate?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  sessionStatus?: SessionStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
