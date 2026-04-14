import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoDto } from './create-video.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @IsOptional()
  @IsString()
  @IsIn(['UPLOADING', 'UPLOADED', 'READY', 'FAILED'])
  status?: 'UPLOADING' | 'UPLOADED' | 'READY' | 'FAILED';
}
