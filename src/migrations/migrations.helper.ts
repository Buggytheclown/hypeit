import * as mysql from 'mysql';
import { ConfigServiceProvider } from '../services/config/config.module';

function promisify<E, R>(
  fn: (cb: (err: E, res: R) => void) => void,
): Promise<R> {
  return new Promise((resolve, reject) => {
    fn((err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

export function execMigration(fn) {
  return promisify(cb => fn(connection, cb));
}

export function logOperation<T>(
  operationName: string,
  promise: Promise<T>,
): Promise<T> {
  console.log(`${operationName}: START`);
  return promise.then(res => {
    console.log(`${operationName}: END`);
    return res;
  });
}

const configService = ConfigServiceProvider.useValue;
const database = configService.get('DATABASE');

export const connection = (() => {
  const con = mysql.createConnection({
    host: configService.get('DATABASE_HOST'),
    user: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    port: configService.databasePort,
    database,
    multipleStatements: true,
    dateStrings: true,
    charset: 'utf8mb4',
  });

  con.connect(err => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }

    console.log('connected as id ' + con.threadId);
  });

  return con;
})();

export function clearBD(con, fn) {
  con.query(
    `
SET FOREIGN_KEY_CHECKS=0;
DROP SCHEMA IF EXISTS ${database};
CREATE SCHEMA ${database} DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_unicode_ci;
USE ${database};
SET FOREIGN_KEY_CHECKS=1;
`,
    fn,
  );
}
