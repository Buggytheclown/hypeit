import { DbPosts } from '../../db/postModel.helpers';

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
