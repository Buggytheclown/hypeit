import { Injectable } from '@nestjs/common';
import {
  DevtoPostData,
  devtoPostDataSchema,
} from '../../services/postDelivery/post.interfaces';
import {
  DevtoRawData,
  DevtoRawDataSchema,
  DevtoRawPost,
} from './devto.interface';
import * as moment from 'moment';
import * as _ from 'lodash';
import { CustomLoggerService } from '../../services/logger/customLogger.service';

function formatDataTime(dateTime: number): string {
  const parsedTime = moment(dateTime * 1000);

  if (!parsedTime.isValid()) {
    throw new TypeError(`Cannot properly parse rawTime: ${dateTime}`);
  }

  return parsedTime.utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
}

function parsePosts({
  title,
  published_at_int,
  path,
  tag_list,
  id,
  public_reactions_count,
  main_image,
}: DevtoRawPost): DevtoPostData {
  return {
    title,
    time: formatDataTime(published_at_int),
    rawTime: String(published_at_int),
    link: `https://dev.to${path}`,
    tags: tag_list.map(_.toLower),
    externalID: String(id),
    imageLink: main_image,
    score: public_reactions_count,
  };
}

@Injectable()
export class DevtoParserService {
  constructor(private readonly cls: CustomLoggerService) {}

  parse(rawData: DevtoRawData): DevtoPostData[] {
    const rawDataValidated: DevtoRawData = DevtoRawDataSchema.validateSync(
      rawData,
      { strict: true },
    );

    return rawDataValidated.result
      .map(post => {
        try {
          return devtoPostDataSchema.validateSync(parsePosts(post), {
            strict: true,
          });
        } catch (e) {
          this.cls.warn(post, `DevtoParserServiceCantparse: ${e.message}`);
          return null as any;
        }
      })
      .filter(Boolean);
  }
}
