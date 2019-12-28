import * as fs from 'fs';

export function writeData(data) {
  fs.writeFileSync('data', JSON.stringify(data));
  return data;
}
