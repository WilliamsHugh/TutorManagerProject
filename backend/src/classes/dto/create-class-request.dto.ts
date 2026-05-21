import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClassRequestDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  subjectId!: string;

  @IsOptional()
  @IsString()
  preferredArea?: string;

  @IsOptional()
  @IsString()
  preferredSchedule?: string;

  @IsOptional()
  @IsString()
  requirements?: string;
}
