import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostDeliveryModule } from './services/postDelivery/postDelivery.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [PostDeliveryModule, DbModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
