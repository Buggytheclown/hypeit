import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }

  get(key: string): string {
    if (!(key in this.envConfig)) {
      throw new TypeError(`key ${key} is missed in envConfig`);
    }
    return this.envConfig[key];
  }
}
