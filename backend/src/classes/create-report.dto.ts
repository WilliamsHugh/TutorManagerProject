import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ProgressRating } from './learning-report.entity';

export class CreateLearningReportDto {
  @IsUUID()
  @IsNotEmpty({ message: 'ID lớp học không được để trống' })
  classId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung báo cáo không được để trống' })
  content!: string;

  @IsString()
  @IsOptional()
  homework?: string;

  @IsEnum(ProgressRating, { message: 'Đánh giá tiến độ không hợp lệ' })
  @IsOptional()
  progressRating?: ProgressRating;
}