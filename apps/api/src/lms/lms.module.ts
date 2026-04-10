import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LmsService } from './lms.service';
import { LmsController } from './lms.controller';
import { LmsCoursesController } from './courses/courses.controller';
import { CourseService } from './courses/course.service';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressService } from './progress/progress.service';
import { StorageService } from './storage/storage.service';
import {
  Course,
  CourseSchema,
  CourseAssignment,
  CourseAssignmentSchema,
  Video,
  VideoSchema,
  VideoProgress,
  VideoProgressSchema,
} from '@app/database';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseAssignment.name, schema: CourseAssignmentSchema },
      { name: Video.name, schema: VideoSchema },
      { name: VideoProgress.name, schema: VideoProgressSchema },
    ]),
  ],
  controllers: [LmsController, LmsCoursesController, VideosController, ProgressController],
  providers: [LmsService, CourseService, VideosService, ProgressService, StorageService],
})
export class LmsModule { }
