import * as fs from 'fs';

export function writeLog<T>(info: string, data: T): T {
  fs.writeFileSync(
    `./logs/${Date.now()}.${info}.json`,
    (JSON.stringify as any)(data, 4, 4),
  );
  return data;
}
