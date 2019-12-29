import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as _ from 'lodash';
import * as hbs from 'hbs';
import * as moment from 'moment';

hbs.registerHelper('extendQuery', (options: any): string => {
  const queryParams = options.data.root.queryParams;
  const restQueryParams = _.omit(options.hash, 'queryParams');

  const extendedQueryParams = { ...queryParams, ...restQueryParams };

  return (
    '?' +
    Object.entries(extendedQueryParams)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  );
});

hbs.registerHelper('moment', (options: any): string => {
  return moment(options).format('LLL');
});

hbs.registerHelper('get', (o, p): string => {
  return o[p];
});

hbs.registerHelper('math', (lvalue, operator, rvalue, options) => {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue,
  }[operator];
});

hbs.registerHelper('cmp', (lvalue, operator, rvalue, options) => {
  return {
    '>': lvalue > rvalue,
    '>=': lvalue >= rvalue,
    '<': lvalue < rvalue,
    '<=': lvalue <= rvalue,
    '===': lvalue === rvalue,
  }[operator];
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
