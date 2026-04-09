import { Module } from '@nestjs/common';
import { LmsService } from './lms.service';
import { LmsController } from './lms.controller';
import { LmsCoursesController } from './courses/courses.controller';
import { CourseService } from './courses/course.service';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressService } from './progress/progress.service';
import { StorageService } from './storage/storage.service';

@Module({
  controllers: [LmsController, LmsCoursesController, VideosController, ProgressController],
  providers: [LmsService, CourseService, VideosService, ProgressService, StorageService],
})
export class LmsModule { }
