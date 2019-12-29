import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as moment from 'moment';
import { MediumRawData } from './medium.interface';
import { mediumRequestPayload } from './mediumRequestPayload';
import * as _ from 'lodash';

interface MediumRequestPayload {
  operationName: string;
  variables: {
    topicSlug: string;
    feedPagingOptions: { limit: number; to: string };
    sidebarPagingOptions: { limit: number };
  };
  query: string;
}

function setPayloadOptions(
  payload: MediumRequestPayload,
  options: { limit?: number; to: number },
): MediumRequestPayload {
  return {
    ...payload,
    variables: {
      ...payload.variables,
      feedPagingOptions: {
        ...payload.variables.feedPagingOptions,
        // limit:25 is a maximum for medium API
        limit: options.limit || 25,
        to: options.to.toString(),
      },
    },
  };
}

function millisecondsWasInXDaysAgo(daysAgo: number): number {
  return moment({ hour: 0, minute: 0 })
    .subtract(daysAgo, 'days')
    .valueOf();
}

function baseMediumRequest({
  daysAgo,
}: {
  daysAgo: number;
}): Promise<MediumRawData> {
  return fetch(`https://medium.com/_/graphql`, {
    method: 'POST',
    body: JSON.stringify(
      setPayloadOptions(mediumRequestPayload, {
        to: millisecondsWasInXDaysAgo(daysAgo),
      }),
    ),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json());
}

function mediumRequest({
  daysAgo,
}: {
  daysAgo: number;
}): Promise<MediumRawData[]> {
  return Promise.all(
    _.range(daysAgo).map(dayAgo => baseMediumRequest({ daysAgo: dayAgo })),
  );
}

@Injectable()
export class MediumHttpService {
  getBestOfTheWeek(): Promise<MediumRawData[]> {
    return mediumRequest({ daysAgo: 7 });
  }

  getBestOfTheMonth(): Promise<MediumRawData[]> {
    return mediumRequest({ daysAgo: 30 });
  }
}
