import { Injectable } from '@nestjs/common';
import {
  MediumPostData,
  mediumPostDataArraySchema,
} from '../../services/postDelivery/post.interfaces';
import * as yup from 'yup';
import * as moment from 'moment';

const PostPreviewSchema = yup.object({
  id: yup.string(),
  tags: yup.array(
    yup.object({
      displayTitle: yup.string(),
    }),
  ),
  title: yup.string(),
  mediumUrl: yup.string(),
  clapCount: yup.number(),
  voterCount: yup.number(),
  previewContent: yup.object({
    subtitle: yup.string(),
  }),
  previewImage: yup.object({
    // + https://miro.medium.com/max/334
    id: yup.string(),
  }),

  updatedAt: yup.number().notRequired(),
  firstPublishedAt: yup.number().notRequired(),
});

const MediumRawDataSchema = yup.object({
  data: yup.object({
    topic: yup.object({
      featuredPosts: yup.object({
        postPreviews: yup.array(yup.object({ post: PostPreviewSchema })),
      }),
      latestPosts: yup.object({
        postPreviews: yup.array(yup.object({ post: PostPreviewSchema })),
      }),
      popularPosts: yup.object({
        postPreviews: yup.array(yup.object({ post: PostPreviewSchema })),
      }),
    }),
  }),
});

type MediumRawData = Required<yup.InferType<typeof MediumRawDataSchema>>;

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
    PostPreviewSchema.validateSync(mediumRawData, { strict: true });

    const topic = mediumRawData.data.topic;

    const posts = [
      ...topic.featuredPosts.postPreviews,
      ...topic.latestPosts.postPreviews,
      ...topic.popularPosts.postPreviews,
    ].map(({ post }) => post);

    const parsedPosts = posts.map(post => {
      const rawTime = post.firstPublishedAt || post.updatedAt;
      return {
        title: post.title,
        time: formatDataTime(rawTime),
        rawTime: rawTime ? String(rawTime) : null,
        link: post.mediumUrl,
        clapCount: post.clapCount,
        voterCount: post.voterCount,
        tags: post.tags.map(({ displayTitle }) => displayTitle),
        externalID: post.id,
        imageLink: `https://miro.medium.com/max/334/${post.previewImage.id}`,
      };
    });

    return mediumPostDataArraySchema.validateSync(parsedPosts);
  }
}
