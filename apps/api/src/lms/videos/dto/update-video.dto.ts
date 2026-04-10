import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoDto } from './create-video.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @IsOptional()
  @IsString()
  @IsIn(['UPLOADING', 'UPLOADED', 'FAILED'])
  status?: 'UPLOADING' | 'UPLOADED' | 'FAILED';
}
