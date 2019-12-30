import * as fs from 'fs';
import * as moment from 'moment';

export function writeLog<T>(info: string, data: T): T {
  fs.writeFileSync(
    `./logs/${moment().format()}.${info}.json`,
    (JSON.stringify as any)(data, 4, 4),
  );
  return data;
}

export function WriteLog() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const oldValue = descriptor.value;

    descriptor.value = function(...args) {
      try {
        const res = oldValue.apply(this, args);
        if (res && res.catch) {
          return res.catch(ce => {
            writeLog(`${target.constructor.name}->${propertyKey}`, args);
            throw ce;
          });
        }
        return res;
      } catch (e) {
        writeLog(`${target.constructor.name}->${propertyKey}`, args);
        throw e;
      }
    };
    return descriptor;
  };
}

export function exhaustiveCheck(param: never): never {
  throw new Error('should not reach here');
}
