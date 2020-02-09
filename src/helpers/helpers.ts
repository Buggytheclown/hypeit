import * as fs from 'fs';
import * as moment from 'moment';
import * as _ from 'lodash';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

export const salt = '$2b$10$1eVGD1C.gGrDQnrkUikBwu';

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
          return res.catch(e => {
            writeLog(`${target.constructor.name}->${propertyKey}`, args);
            throw e;
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

enum FetchTransformers {
  TEXT,
  JSON,
}

function getTransformer(type: FetchTransformers) {
  switch (type) {
    case FetchTransformers.TEXT:
      return res => res.text();

    case FetchTransformers.JSON:
      return res => res.json();

    default:
      exhaustiveCheck(type);
  }
}

// Create timeoutFetch?
export function prepareTimeoutController(time: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, time);

  return { controller, timeout };
}

export function loadChunked<T>(
  reqBuilder: (
    index: number,
  ) => { url: string; options: Object; transformerType: FetchTransformers },
  {
    concurrent = 5,
    count,
    timeoutTime = 5000,
  }: { concurrent?: number; timeoutTime?: number; count: number },
): Promise<T[]> {
  return _.chunk(_.range(1, count + 1), concurrent).reduce(
    async (accPromise, curPages) => {
      const acc = await accPromise;
      const curReses = await Promise.all(
        curPages.map(curPage => {
          const { url, options, transformerType } = reqBuilder(curPage);

          const { controller, timeout } = prepareTimeoutController(timeoutTime);
          // TODO: replace with timeoutFetch
          return fetch(url, { signal: controller.signal, ...options })
            .then(getTransformer(transformerType))
            .catch(err => {
              if (err.name === 'AbortError') {
                console.log(
                  `Request was aborted due to timeout: ${timeoutTime}ms, url: ${url}`,
                );
                return '';
              }
              throw err;
            })
            .finally(() => {
              clearTimeout(timeout);
            });
        }),
      );
      return [...acc, ...curReses.filter(Boolean)];
    },
    Promise.resolve([]),
  );
}

loadChunked.transformerType = FetchTransformers;
