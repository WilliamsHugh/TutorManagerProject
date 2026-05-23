import { IsEnum } from 'class-validator';
import { ClassStatus } from '../entities/class.entity';

export class UpdateClassStatusDto {
  @IsEnum(ClassStatus)
  status!: ClassStatus;
}
