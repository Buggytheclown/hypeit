import * as yup from 'yup';
import { PostResourcesData } from './postResourses.interfaces';

export enum PostResources {
  HABR = 'habr',
  MEDIUM = 'medium',
  DEVTO = 'devto',
}

export interface PostGrabber {
  resource: PostResources;
  getBestOfTheWeek(): Promise<PostResourcesData>;
  getBestOfTheMonth(): Promise<PostResourcesData>;
}

const basePostDataFields = {
  title: yup.string().required(),
  time: yup.string().required(),
  rawTime: yup.string(),
  link: yup.string().required(),
  tags: yup.array(yup.string()).ensure(),
  externalID: yup.string().required(),
  imageLink: yup.string().nullable(),
};

export const postDataSchema = yup.object(basePostDataFields);

const mediumPostRatingInfoFields = {
  clapCount: yup.number().required(),
  voterCount: yup.number().required(),
};

const mediumPostRatingInfoSchema = yup.object(mediumPostRatingInfoFields);

export type MediumPostRatingInfo = Required<
  yup.InferType<typeof mediumPostRatingInfoSchema>
>;

export const mediumPostDataSchema = yup.object({
  ...basePostDataFields,
  ...mediumPostRatingInfoFields,
});

const habrPostRatingInfoFields = {
  totalVotes: yup.number().required(),
  totalViews: yup.number().required(),
};

const habrPostRatingInfoSchema = yup.object(habrPostRatingInfoFields);

export type HabrPostRatingInfo = Required<
  yup.InferType<typeof habrPostRatingInfoSchema>
>;

export const habrPostDataSchema = yup.object({
  ...basePostDataFields,
  ...habrPostRatingInfoFields,
});

const devtoPostRatingInfoFields = {
  score: yup.number().required(),
};

const devtoPostRatingInfoSchema = yup.object(devtoPostRatingInfoFields);

export type DevtoPostRatingInfo = Required<
  yup.InferType<typeof devtoPostRatingInfoSchema>
>;

export const devtoPostDataSchema = yup.object({
  ...basePostDataFields,
  ...devtoPostRatingInfoFields,
});

export type PostsRatingInfo = MediumPostRatingInfo | HabrPostRatingInfo;

export const postDataArraySchema = yup.array(postDataSchema);
export const habrPostDataArraySchema = yup.array(habrPostDataSchema);
export const mediumPostDataArraySchema = yup.array(mediumPostDataSchema);

export type PostData = Required<yup.InferType<typeof postDataSchema>>;
export type MediumPostData = Required<
  yup.InferType<typeof mediumPostDataSchema>
>;
export type HabrPostData = Required<yup.InferType<typeof habrPostDataSchema>>;

export type DevtoPostData = Required<yup.InferType<typeof devtoPostDataSchema>>;
