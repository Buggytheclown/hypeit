import * as yup from 'yup';

export const PostPreviewSchema = yup.object({
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

export const MediumRawDataSchema = yup.object({
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

export type MediumRawData = Required<yup.InferType<typeof MediumRawDataSchema>>;
