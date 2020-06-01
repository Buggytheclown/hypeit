import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as moment from 'moment';
import { DevtoRawData } from './devto.interface';
import { prepareTimeoutController } from '../../helpers/helpers';

const url = `https://dev.to/search/feed_content`;

function toQueryParamsString(queryParams: { [key: string]: any }) {
  return Object.entries(queryParams)
      .map(kv => kv.map(encodeURI).join('='))
      .join('&');
}

function simpleGet({
  postCount,
  daysAgo,
}: {
  postCount: number;
  daysAgo: number;
}): Promise<DevtoRawData> {
  const { controller, timeout } = prepareTimeoutController(5000);
  const queryParams = {
    per_page: postCount,
    page: 0,
    sort_by: 'positive_reactions_count',
    sort_direction: 'desc',
    approved: '',
    class_name: 'Article',
    'published_at[gte]': moment().subtract(daysAgo, 'days').format('YYYY-MM-DDT00:00:01[Z]'),
  };
  const path = `${url}?${toQueryParamsString(queryParams)}`;

  return fetch(path, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
  })
    .then(res => res.json())
    .finally(() => {
      clearTimeout(timeout);
    });
}

@Injectable()
export class DevtoHttpService {
  getBestOfTheWeek(): Promise<DevtoRawData> {
    return simpleGet({ daysAgo: 7, postCount: 200 });
  }

  getBestOfTheMonth(): Promise<DevtoRawData> {
    return simpleGet({ daysAgo: 30, postCount: 500 });
  }
}
