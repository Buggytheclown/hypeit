import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as moment from 'moment';
import { MediumRawData } from './medium.interface';
import { mediumRequestPayload } from './mediumRequestPayload';

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
  options: { limit: number; to: number },
): MediumRequestPayload {
  return {
    ...payload,
    variables: {
      ...payload.variables,
      feedPagingOptions: {
        ...payload.variables.feedPagingOptions,
        limit: options.limit,
        to: options.to.toString(),
      },
    },
  };
}

function millisecondsWasInXDays(daysAgo: number): number {
  return moment({ hour: 0, minute: 0 })
    .subtract(daysAgo, 'days')
    .valueOf();
}

function mediumRequest({
  daysAgo,
  limit,
}: {
  daysAgo: number;
  limit: number;
}): Promise<MediumRawData> {
  return fetch(`https://medium.com/_/graphql`, {
    method: 'POST',
    body: JSON.stringify(
      setPayloadOptions(mediumRequestPayload, {
        limit,
        to: millisecondsWasInXDays(7),
      }),
    ),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json());
}

@Injectable()
export class MediumHttpService {
  getBestOfTheWeek(limit: number): Promise<MediumRawData> {
    return mediumRequest({ limit, daysAgo: 7 });
  }

  getBestOfTheMonth(limit: number): Promise<MediumRawData> {
    return mediumRequest({ limit, daysAgo: 30 });
  }
}
