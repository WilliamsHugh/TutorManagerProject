import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ProgressRating } from './learning-report.entity';

export class CreateLearningReportDto {
  @IsString()
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

  @IsBoolean({ message: 'Trạng thái điểm danh phải là kiểu đúng/sai' })
  @IsNotEmpty({ message: 'Trạng thái điểm danh không được để trống' })
  attendanceStatus!: boolean;
}