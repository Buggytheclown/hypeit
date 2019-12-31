import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as moment from 'moment';
import { DevtoRawData } from './devto.interface';
import { prepareTimeoutController, writeLog } from '../../helpers/helpers';

const url = `https://ye5y9r600c-dsn.algolia.net/1/indexes/ordered_articles_by_positive_reactions_count_production/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.20.3&x-algolia-application-id=YE5Y9R600C&x-algolia-api-key=YWVlZGM3YWI4NDg3Mjk1MzJmMjcwNDVjMjIwN2ZmZTQ4YTkxOGE0YTkwMzhiZTQzNmM0ZGFmYTE3ZTI1ZDFhNXJlc3RyaWN0SW5kaWNlcz1zZWFyY2hhYmxlc19wcm9kdWN0aW9uJTJDVGFnX3Byb2R1Y3Rpb24lMkNvcmRlcmVkX2FydGljbGVzX3Byb2R1Y3Rpb24lMkNDbGFzc2lmaWVkTGlzdGluZ19wcm9kdWN0aW9uJTJDb3JkZXJlZF9hcnRpY2xlc19ieV9wdWJsaXNoZWRfYXRfcHJvZHVjdGlvbiUyQ29yZGVyZWRfYXJ0aWNsZXNfYnlfcG9zaXRpdmVfcmVhY3Rpb25zX2NvdW50X3Byb2R1Y3Rpb24lMkNvcmRlcmVkX2NvbW1lbnRzX3Byb2R1Y3Rpb24%3D`;

function getTimeDelta(days): number {
  return Math.trunc(+moment().subtract(days, 'days') / 1000);
}

function simpleGet({
  postCount,
  fromTime,
}: {
  postCount: number;
  fromTime: number;
}): Promise<DevtoRawData> {
  const { controller, timeout } = prepareTimeoutController(5000);

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      params: `query=*&hitsPerPage=${postCount}&page=0&attributesToHighlight=%5B%5D&tagFilters=%5B%5D&filters=published_at_int%20%3E%20${fromTime}`,
    }),
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
    return simpleGet({ fromTime: getTimeDelta(7), postCount: 150 });
  }

  getBestOfTheMonth(): Promise<DevtoRawData> {
    return simpleGet({ fromTime: getTimeDelta(30), postCount: 500 });
  }
}
