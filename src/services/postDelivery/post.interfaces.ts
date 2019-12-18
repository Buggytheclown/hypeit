import * as yup from 'yup';

export enum PostResources {
  HABR = 'habr',
}

export const postDataSchema = yup.object({
  title: yup.string(),
  time: yup.string(),
  rawTime: yup.string(),
  link: yup.string(),
  rating: yup.number(),
  tags: yup.array(yup.string()),
  externalID: yup.string(),
  imageLink: yup.string(),
});

export const postDataArraySchema = yup.array(postDataSchema);

export type PostData = yup.InferType<typeof postDataSchema>;
export type PostDataArray = yup.InferType<typeof postDataArraySchema>;
