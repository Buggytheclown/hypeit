import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as _ from 'lodash';

import * as hbs from 'hbs';

hbs.registerHelper(
  'extendQuery',
  (options: any): string => {
    const queryParams = options.data.root.queryParams;
    const restQueryParams = _.omit(options.hash, 'queryParams');

    const extendedQueryParams = { ...queryParams, ...restQueryParams };

    return (
      '?' +
      Object.entries(extendedQueryParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    );
  },
);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
