import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { PostData } from '../../services/postDelivery/post.interfaces';

function getFormatterToParse(rawTime: string): string {
  if (rawTime.includes('today')) {
    return 'hh:mm a';
  }

  return 'MMMM DD, YYYY at hh:mm a';
}

function rawTimeToDateTime(rawTime: string): string {
  const parsedTime = moment(rawTime, getFormatterToParse(rawTime));

  if (!parsedTime.isValid()) {
    throw new TypeError(`Cannot properly parse rawTime: ${rawTime}`);
  }

  // TODO: extract formatter to utils
  return parsedTime.utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
}

// TODO: add validators
@Injectable()
export class HabrParserService {
  parse(data: string): PostData[] {
    const $ = cheerio.load(data);
    const posts = $('.posts_list .content-list__item_post');

    const parsedPosts = posts.map(
      (_, el): PostData => {
        const $el = $(el);
        const title = $el.find('.post__title a').text();

        const rawTime = $el.find('.post__meta .post__time').text();
        const time = rawTimeToDateTime(rawTime);

        const tags = $el
          .find('.post__hubs li a')
          .map((_, el2) => $(el2).text())
          .toArray();

        const link = $el.find('.post__title a').attr('href');

        const externalID = $(el)
          .find('footer .bookmark-btn')
          .data('id');

        if (!externalID) {
          throw new TypeError(`Cant parse externalID for post title: ${title}`);
        }

        const rating = +$(el)
          .find('.post-stats__result-counter')
          .text();

        if (!Number.isInteger(rating)) {
          throw new TypeError(`Cant parse rating for post title: ${title}`);
        }

        return {
          title,
          time,
          tags,
          link,
          rating,
          rawTime,
          externalID: externalID.toString(),
        };
      },
    );

    return parsedPosts.toArray();
  }
}
