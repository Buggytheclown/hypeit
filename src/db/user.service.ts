import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import * as bcrypt from 'bcrypt';
import { esc } from './helpers';
import { salt } from '../helpers/helpers';
import * as yup from 'yup';
import * as _ from 'lodash';

const dbUserSchema = yup.object({
  user_id: yup.number(),
  name: yup.string(),
  password: yup.string(),
});
type DbUser = yup.InferType<typeof dbUserSchema>;

@Injectable()
export class UserService {
  constructor(private readonly dBConnection: DBConnection) {}

  async saveUser({ name, password }: { name: string; password: string }) {
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO users(name, password) VALUE (${esc(name)}, ${esc(
      hashedPassword,
    )})`;
    return this.dBConnection.query(query);
  }

  async getVerifiedUser({
    name,
    password,
  }: {
    name: string;
    password: string;
  }): Promise<Omit<DbUser, 'password'> | null> {
    const query = `SELECT * FROM users WHERE name = ${esc(name)}`;
    const user: DbUser = await this.dBConnection
      .query(query)
      .then(({ results: [data] }) => data)
      .then(res => dbUserSchema.validateSync(res));

    if (await bcrypt.compare(password, user.password)) {
      return _.omit(user, 'password');
    }
    return null;
  }

  async isUsernameExist({ name }: { name: string }): Promise<boolean> {
    const query = `SELECT * FROM users WHERE name = ${esc(name)}`;
    return this.dBConnection.query(query).then(({ results: [data] }) => !!data);
  }
}
