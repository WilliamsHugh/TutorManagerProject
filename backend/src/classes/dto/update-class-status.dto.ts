import { IsEnum } from 'class-validator';
import { ClassStatus } from '../class.entity';

export class UpdateClassStatusDto {
  @IsEnum(ClassStatus)
  status!: ClassStatus;
}
