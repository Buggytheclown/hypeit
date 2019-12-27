import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import {
  HabrPostData,
  habrPostDataSchema,
} from '../../services/postDelivery/post.interfaces';
import { Moment } from 'moment';

function parseDateTimeString(rawTime: string): Moment {
  if (rawTime.includes('today')) {
    return moment(rawTime, 'hh:mm a');
  }

  if (rawTime.includes('yesterday')) {
    return moment(rawTime, 'hh:mm a').subtract(1, 'days');
  }

  return moment(rawTime, 'MMMM DD, YYYY at hh:mm a');
}

function rawTimeToDateTime(
  rawTime: string,
  title: string,
  ind: number,
): string {
  const parsedTime = parseDateTimeString(rawTime);

  if (!parsedTime.isValid()) {
    throw new TypeError(
      `Cannot properly parse rawTime: ${rawTime} for post ind:${ind}, title: ${title}`,
    );
  }

  return parsedTime.utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
}

function parseNormalizedCount(data: string): number {
  if (data.includes('k')) {
    return +data.replace('k', '') * 1000;
  }
  return +data;
}

function parsePosts($, ind, el): HabrPostData {
  const $el = $(el);
  const title = $el.find('.post__title a').text();

  const rawTime = $el.find('.post__meta .post__time').text();
  const time = rawTimeToDateTime(rawTime, title, ind);

  const tags = $el
    .find('.post__hubs li a')
    .map((_, el2) => $(el2).text())
    .toArray();

  const link = $el.find('.post__title a').attr('href');

  const externalID = $el.find('footer .bookmark-btn').data('id');

  const totalVotes = parseNormalizedCount(
    $el.find('.post-stats__result-counter').text(),
  );

  const totalViews = parseNormalizedCount(
    $el.find('.post-stats__views-count').text(),
  );

  const imageLink = $el.find('.post__body img').attr('src') || null;

  return {
    title,
    time,
    tags,
    link,
    totalVotes,
    totalViews,
    rawTime,
    externalID: externalID.toString(),
    imageLink,
  };
}

@Injectable()
export class HabrParserService {
  parse(data: string): HabrPostData[] {
    const $ = cheerio.load(data);
    const posts = $('.posts_list .content-list__item_post');

    return posts
      .filter(
        (_, el) =>
          $(el).attr('id') &&
          $(el)
            .find('.post__title a')
            .text(),
      )
      .map((ind, el) => {
        try {
          return habrPostDataSchema.validateSync(parsePosts($, ind, el), {
            strict: true,
          });
        } catch (e) {
          console.log($.html(el));
          throw e;
        }
      })
      .toArray();
  }
}
