import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import * as session from 'express-session';
import * as express_mysql_session from 'express-mysql-session';
import { DbOptions } from './db/dBConnection.service';
import { ConfigServiceProvider } from './services/config/config.module';
import { registerHbsHelpers } from './hbs.helpers';

async function bootstrap() {
  registerHbsHelpers();
  const MySQLStore = express_mysql_session(session);
  const sessionStore = new MySQLStore(DbOptions);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  app.setViewEngine('hbs');
  app.use(
    session({
      key: 'sid',
      secret: 'secret_string',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(ConfigServiceProvider.useValue.get('PORT'));
}
bootstrap();
