import * as yup from 'yup';

export enum PostResources {
  HABR = 'habr',
  MEDIUM = 'medium',
}

const basePostDataFields = {
  title: yup.string(),
  time: yup.string(),
  rawTime: yup.string(),
  link: yup.string(),
  tags: yup.array(yup.string()),
  externalID: yup.string(),
  imageLink: yup.string().nullable(),
};

export const postDataSchema = yup.object(basePostDataFields);

const mediumPostRatingInfoFields = {
  clapCount: yup.number(),
  voterCount: yup.number(),
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
  totalVotes: yup.number(),
  totalViews: yup.number(),
};

const habrPostRatingInfoSchema = yup.object(habrPostRatingInfoFields);

export type HabrPostRatingInfo = Required<
  yup.InferType<typeof habrPostRatingInfoSchema>
>;

export const habrPostDataSchema = yup.object({
  ...basePostDataFields,
  ...habrPostRatingInfoFields,
});

export type PostsRatingInfo = MediumPostRatingInfo | HabrPostRatingInfo;

export const postDataArraySchema = yup.array(postDataSchema);
export const habrPostDataArraySchema = yup.array(habrPostDataSchema);
export const mediumPostDataArraySchema = yup.array(mediumPostDataSchema);

export type PostData = Required<yup.InferType<typeof postDataSchema>>;
export type MediumPostData = Required<
  yup.InferType<typeof mediumPostDataSchema>
>;
export type HabrPostData = Required<
  yup.InferType<typeof habrPostDataSchema>
>;
