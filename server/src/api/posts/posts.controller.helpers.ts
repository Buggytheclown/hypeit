import { DbPosts } from '../../db/postModel.helpers';
import * as yup from 'yup';

export interface IBasicPostPageData {
  posts: DbPosts;
  queryParams: Object;
  totalPosts: number;
  totalSeenPosts: number;
  currentPage: number;
  resources: { [key: string]: string };
}

export interface IPostRequest {
  userId?: number;
  /** За последний день, неделю или месяц */
  lastXDays: number;
  tagName?: string;
  bookmarked?: boolean;
  isNextPage?: boolean;
}

export const postsRequestParamsSchema = yup.object({
  userId: yup.number().notRequired(),
  lastXDays: yup.number().required(),
  tagName: yup.string().notRequired(),
  isNextPage: yup
    .boolean()
    .default(false)
    .notRequired(),
  bookmarked: yup
    .boolean()
    .default(false)
    .notRequired(),
});

export type TPostsRequestParamsSchema = yup.InferType<
  typeof postsRequestParamsSchema
>;
