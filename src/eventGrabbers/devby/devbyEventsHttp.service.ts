import { Injectable } from '@nestjs/common';
import { loadChunked } from '../../helpers/helpers';

const options = {};

@Injectable()
export class DevbyEventsHttpService {
  getEvents(pageCount: number): Promise<string[]> {
    return loadChunked(
      page => ({
        url: `https://events.dev.by/?page=${page}`,
        options,
        transformerType: loadChunked.transformerType.TEXT,
      }),
      { count: pageCount },
    );
  }
}
