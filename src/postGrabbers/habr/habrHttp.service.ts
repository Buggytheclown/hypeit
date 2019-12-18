import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as _ from 'lodash';

const options = {
  headers: {
    cookie: 'fl=ru%2Cen',
  },
};

@Injectable()
export class HabrHttpService {
  getBestOfTheWeek(pageCount: number): Promise<string[]> {
    const requests = _.range(1, pageCount).map(page => {
      return fetch(
        `https://habr.com/en/flows/develop/top/weekly/page${page}/`,
        options,
      ).then(res => res.text());
    });

    return Promise.all(requests);
  }

  getBestOfTheMonth(pageCount: number): Promise<string[]> {
    const requests = _.range(1, pageCount).map(page => {
      return fetch(
        `https://habr.com/en/flows/develop/top/monthly/page${page}/`,
        options,
      ).then(res => res.text());
    });

    return Promise.all(requests);
  }
}
