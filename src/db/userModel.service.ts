import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import * as bcrypt from 'bcrypt';
import { salt } from '../helpers/helpers';
import * as yup from 'yup';
import * as _ from 'lodash';

const dbUserSchema = yup.object({
  user_id: yup.number(),
  name: yup.string(),
  password: yup.string(),
});
type DbUser = yup.InferType<typeof dbUserSchema>;

const dbUserSimpleSchema = yup.object({
  user_id: yup.number(),
  name: yup.string(),
});
type DbUserSimple = yup.InferType<typeof dbUserSimpleSchema>;

@Injectable()
export class UserModelService {
  constructor(private readonly dBConnection: DBConnection) {}

  async saveUser({ name, password }: { name: string; password: string }) {
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.dBConnection
      .knex('users')
      .insert({ name, password: hashedPassword })
      .then(_.identity);
  }

  async getVerifiedUser({
    name,
    password,
  }: {
    name: string;
    password: string;
  }): Promise<Omit<DbUser, 'password'> | null> {
    const user: DbUser = await this.dBConnection
      .knex('users')
      .select('*')
      .where({ name })
      .then(([data]) => data)
      .then(res => dbUserSchema.validateSync(res));

    if (user.password && (await bcrypt.compare(password, user.password))) {
      return _.omit(user, 'password');
    }
    return null;
  }

  async isUsernameExist({ name }: { name: string }): Promise<boolean> {
    return this.dBConnection
      .knex('users')
      .select('*')
      .where({ name })
      .then(([data]) => !!data);
  }

  async getUsers(): Promise<DbUserSimple[]> {
    return this.dBConnection
      .knex('users')
      .select('user_id', 'name')
      .where({ name })
      .then(res => yup.array(dbUserSimpleSchema).validateSync(res));
  }
}
