import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { writeLog } from '../../helpers/helpers';
import * as yup from 'yup';
import * as moment from 'moment';

const eventDataSchema = yup.object({
  time: yup.string().required(),
  link: yup.string().required(),
  title: yup.string().required(),
});

export type EventData = Required<yup.InferType<typeof eventDataSchema>>;

function rawTimeToDateTime(rawTime: string, ind: number, title: string) {
  const time = moment(rawTime);

  if (!time.isValid()) {
    throw new TypeError(
      `Cannot properly parse rawTime: ${rawTime} for event ind:${ind}, title: ${title}`,
    );
  }
  return time.utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
}

function parseEvent($, ind, el) {
  const $el = $(el);

  const mainLink = $el.find('.item-body a').first();

  const title = mainLink.text();
  const link = `https://events.dev.by${mainLink.attr('href')}`;

  const rawTime = $el.find('.item-date time').attr('datetime');
  const time = rawTimeToDateTime(rawTime, ind, title);

  return { time, link, title };
}

@Injectable()
export class DevbyEventsParserService {
  parse(data: string): EventData[] {
    const $ = cheerio.load(data);
    const events = $('.list-item-events .item');

    return (events
      .map(
        (ind, el): EventData => {
          try {
            return eventDataSchema.validateSync(parseEvent($, ind, el), {
              strict: true,
            });
          } catch (e) {
            writeLog('DevbyEventsParserServiceCantParse', $.html(el));
            throw e;
          }
        },
      )
      .toArray() as any) as EventData[];
  }
}
