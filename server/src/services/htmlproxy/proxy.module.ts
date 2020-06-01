import { HttpModule, Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
