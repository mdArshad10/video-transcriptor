import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LmsModule } from './lms/lms.module';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@app/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '@app/database';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LmsModule,
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
