import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LmsService } from './lms.service';

@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) { }

  @Get()
  healthCheck() {
    return { message: 'LMS is running' }
  }
}
