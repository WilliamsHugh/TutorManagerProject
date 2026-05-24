import { IsDateString, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClassDto {
  @IsUUID()
  requestId!: string;

  @IsUUID()
  tutorId!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumberString()
  feePerSession?: string;

  @IsOptional()
  @IsNumberString()
  totalSessions?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
