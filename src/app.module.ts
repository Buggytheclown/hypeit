import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PostDeliveryModule } from './services/postDelivery/postDelivery.module';
import { DbModule } from './db/db.module';
import { TasksModule } from './services/tasks/tasks.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PostDeliveryModule,
    DbModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
