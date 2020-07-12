import { DbPosts } from '../../db/postModel.helpers';
import * as yup from 'yup';

export interface BasicPostPageData {
  posts: DbPosts;
  queryParams: Object;
  totalPosts: number;
  totalSeenPosts: number;
  currentPage: number;
  resources: { [key: string]: string };
}

export interface PostRequest {
  userId?: number;
  lastXDays: number;
  tagName?: string;
  bookmarked?: boolean;
  isNextPage?: boolean;
}

export const postsRequestParamsSchema = yup.object({
  userId: yup.number().notRequired(),
  lastXDays: yup
    .number()
    .min(0)
    .required(),
  tagName: yup.string().notRequired(),
  bookmarked: yup.boolean().notRequired(),
  isNextPage: yup
    .boolean()
    .default(false)
    .notRequired(),
});

export type PostsRequestParamsSchema = yup.InferType<
  typeof postsRequestParamsSchema
>;
