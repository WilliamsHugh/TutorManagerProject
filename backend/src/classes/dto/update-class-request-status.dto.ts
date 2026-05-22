import { IsEnum } from 'class-validator';
import { RequestStatus } from '../class-request.entity';

export class UpdateClassRequestStatusDto {
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
