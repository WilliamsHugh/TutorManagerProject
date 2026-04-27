// backend/src/classes/dto/create-report.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreateLearningReportDto {
  @IsUUID()
  @IsNotEmpty({ message: 'ID lớp học không được để trống' })
  classId!: string;


  @IsString()
  @IsNotEmpty()
  content!: string; // Nội dung buổi học

  @IsBoolean()
  attendanceStatus!: boolean; // Có đi học hay không
}