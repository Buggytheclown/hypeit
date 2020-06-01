import { Injectable } from '@nestjs/common';
import {
  MediumPostData,
  mediumPostDataSchema,
} from '../../services/postDelivery/post.interfaces';
import * as moment from 'moment';
import { MediumRawData, MediumRawDataSchema } from './medium.interface';
import * as _ from 'lodash';
import { writeLog } from '../../helpers/helpers';

function formatDataTime(dateTime?: number): string {
  const format = 'YYYY-MM-DD HH:mm:ss';
  if (!dateTime) {
    return moment({ hour: 12, minute: 0, seconds: 0 }).format(
      'YYYY-MM-DD HH:mm:ss',
    );
  }
  return moment(dateTime)
    .utcOffset(0)
    .format(format);
}

@Injectable()
export class MediumParserService {
  parse(mediumRawData: MediumRawData): MediumPostData[] {
    const mediumRawDataValidated: MediumRawData = MediumRawDataSchema.validateSync(
      mediumRawData,
      { strict: true },
    );

    const topic = mediumRawDataValidated.data.topic;

    const posts = [
      ...topic.featuredPosts.postPreviews,
      ...topic.latestPosts.postPreviews,
      // ignore popular posts as they doth not have date
      // ...topic.popularPosts.postPreviews,
    ].map(({ post }) => post);

    return posts.map(post => {
      const rawTime = post.firstPublishedAt || post.updatedAt;
      try {
        return mediumPostDataSchema.validateSync(
          {
            title: post.title,
            time: formatDataTime(rawTime),
            rawTime: rawTime ? String(rawTime) : null,
            link: post.mediumUrl,
            clapCount: post.clapCount,
            voterCount: post.voterCount,
            tags: post.tags.map(({ displayTitle }) => _.toLower(displayTitle)),
            externalID: post.id,
            imageLink: `https://miro.medium.com/max/334/${post.previewImage.id}`,
          },
          { strict: true },
        );
      } catch (e) {
        writeLog('MediumParserServiceCantParse', post);
        throw e;
      }
    });
  }
}
