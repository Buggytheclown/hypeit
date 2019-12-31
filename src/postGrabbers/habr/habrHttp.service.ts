import { Injectable } from '@nestjs/common';
import { loadChunked } from '../../helpers/helpers';

const options = {
  headers: {
    cookie: 'fl=ru%2Cen',
  },
};

@Injectable()
export class HabrHttpService {
  getBestOfTheWeek(pageCount: number): Promise<string[]> {
    return loadChunked(
      page => ({
        url: `https://habr.com/en/flows/develop/top/weekly/page${page}/`,
        options,
        transformerType: loadChunked.transformerType.TEXT,
      }),
      { count: pageCount },
    );
  }

  getBestOfTheMonth(pageCount: number): Promise<string[]> {
    return loadChunked(
      page => ({
        url: `https://habr.com/en/flows/develop/top/monthly/page${page}/`,
        options,
        transformerType: loadChunked.transformerType.TEXT,
      }),
      { count: pageCount },
    );
  }
}
