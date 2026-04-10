import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LmsModule } from './lms/lms.module';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@app/config';

@Module({
  imports: [ConfigModule, DatabaseModule, LmsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
