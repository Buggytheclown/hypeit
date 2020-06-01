import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as yup from 'yup';
import * as _ from 'lodash';

export enum Env {
  DEV = 'DEV',
  PROD = 'PROD',
  TEST = 'TEST',
}

const envSchema = yup.object({
  ENV: yup
    .mixed()
    .oneOf([Env.DEV, Env.PROD, Env.TEST])
    .required(),
  SENTRY_DSN: yup.string().required(),
  DATABASE_HOST: yup.string().required(),
  DATABASE_USER: yup.string().required(),
  DATABASE_PASSWORD: yup.string().required(),
  DATABASE_PORT: yup.number().required(),
  DATABASE: yup.string().required(),
  TIMEZONE: yup.string().required(),
  PORT: yup.string().required(),
});

type IEnv = yup.InferType<typeof envSchema>;

const envKeys: Array<keyof IEnv> = [
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_PORT',
  'DATABASE',
  'TIMEZONE',
  'PORT',
  'ENV',
  'SENTRY_DSN',
];

export class ConfigService {
  private readonly envConfig: IEnv;

  constructor(filePath: string) {
    this.envConfig = envSchema.validateSync({
      ...dotenv.parse(fs.readFileSync(filePath)),
      ..._.pick(process.env, envKeys),
    });
  }

  /**
   * @deprecated, use getter instead
   */
  get(key: string): string {
    if (!(key in this.envConfig)) {
      throw new TypeError(`key ${key} is missed in envConfig`);
    }
    return this.envConfig[key];
  }

  get env(): Env {
    return this.envConfig.ENV;
  }

  get sentryDsn(): string {
    return this.envConfig.SENTRY_DSN;
  }

  get databasePort(): number {
    return this.envConfig.DATABASE_PORT;
  }
}
