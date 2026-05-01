import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LmsModule } from './lms/lms.module';
import { Course, CourseSchema, DatabaseModule } from '@app/database';
import { ConfigModule } from '@app/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '@app/database';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    LmsModule,
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name:Course.name, schema:CourseSchema }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
