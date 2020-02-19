import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PostDeliveryModule } from './services/postDelivery/postDelivery.module';
import { DbModule } from './db/db.module';
import { TasksModule } from './services/tasks/tasks.module';
import { CustomLoggerModule } from './services/logger/customLogger.module';
import { ProxyModule } from './services/htmlproxy/proxy.module';
import { DevbyEventsModule } from './eventGrabbers/devby/devbyEvents.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PostDeliveryModule,
    DbModule,
    TasksModule,
    CustomLoggerModule.forRoot(),
    ProxyModule,
    DevbyEventsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
