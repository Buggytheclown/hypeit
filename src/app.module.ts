import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostDeliveryModule } from './services/postDelivery/postDelivery.module';

@Module({
  imports: [PostDeliveryModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
