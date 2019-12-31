import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { MediumRawData } from './medium.interface';
import { mediumRequestPayload } from './mediumRequestPayload';
import { loadChunked } from '../../helpers/helpers';

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

function buildRequestOptions(daysAgo: number) {
  return {
    method: 'POST',
    body: JSON.stringify(
      setPayloadOptions(mediumRequestPayload, {
        to: millisecondsWasInXDaysAgo(daysAgo),
      }),
    ),
    headers: { 'Content-Type': 'application/json' },
  };
}

function mediumRequest({
  daysAgo,
}: {
  daysAgo: number;
}): Promise<MediumRawData[]> {
  return loadChunked(
    page => ({
      url: `https://medium.com/_/graphql`,
      options: buildRequestOptions(page),
      transformerType: loadChunked.transformerType.JSON,
    }),
    { count: daysAgo },
  );
}

@Injectable()
export class MediumHttpService {
  getBestOfTheWeek(): Promise<MediumRawData[]> {
    return mediumRequest({ daysAgo: 10 });
  }

  getBestOfTheMonth(): Promise<MediumRawData[]> {
    return mediumRequest({ daysAgo: 30 });
  }
}
