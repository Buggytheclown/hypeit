import * as mysql from 'mysql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../services/config/config.service';
import { ConfigServiceProvider } from '../services/config/config.module';

const configService: ConfigService = ConfigServiceProvider.useValue;

export const DbOptions = {
  host: configService.get('DATABASE_HOST'),
  user: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE'),
  timezone: configService.get('TIMEZONE'),
  port: configService.get('DATABASE_PORT'),
  multipleStatements: true,
  dateStrings: true,
  charset: 'utf8mb4',
};

@Injectable()
export class DBConnection {
  connection: any;

  constructor() {
    this.connection = mysql.createConnection(DbOptions);

    this.connection.connect(err => {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }

      console.log('connected as id ' + this.connection.threadId);
    });
  }

  query(query: string): Promise<{ results: any; fields: any }> {
    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, results, fields) => {
        if (error) {
          reject(error);
        }
        resolve({ results, fields });
      });
    });
  }

  destroy() {
    this.connection.destroy();
  }
}
