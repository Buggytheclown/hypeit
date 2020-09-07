import { DbPosts } from '../../db/postModel.helpers';

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
