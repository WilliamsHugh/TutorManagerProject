import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}