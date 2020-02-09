import * as yup from 'yup';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PostResources } from './services/postDelivery/post.interfaces';
import { exhaustiveCheck } from './helpers/helpers';

export const postsQueryParamsSchema = yup.object({
  page: yup
    .number()
    .nullable()
    .min(1)
    .default(1),
  bestof: yup
    .number()
    .nullable()
    .min(0)
    .default(7),
  isNextPage: yup.boolean().nullable(),
});

export type PostsQueryParamsType = yup.InferType<typeof postsQueryParamsSchema>;

export enum AUTH_TYPE {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
}

export const postsBookmarkBodySchema = yup.object({
  postId: yup.number().required(),
  bookmark: yup.boolean().required(),
});

export type PostsBookmarkBody = yup.InferType<typeof postsBookmarkBodySchema>;

export const authBodySchema = yup.object({
  form_type: yup.mixed().oneOf([AUTH_TYPE.LOGIN, AUTH_TYPE.REGISTER]),
  username: yup.string().min(3),
  password: yup.string().min(5),
  password2: yup.string().min(5),
});
export type AuthBodyType = yup.InferType<typeof authBodySchema>;

export enum UPDATE_TYPE {
  DEVTO = 'DEVTO',
  MEDIUM = 'MEDIUM',
  HABR = 'HABR',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}
export const updateBodySchema = yup.object({
  update_type: yup
    .mixed()
    .oneOf([
      UPDATE_TYPE.DEVTO,
      UPDATE_TYPE.HABR,
      UPDATE_TYPE.MEDIUM,
      UPDATE_TYPE.WEEK,
      UPDATE_TYPE.MONTH,
    ]),
});
export type UpdateBodyType = yup.InferType<typeof updateBodySchema>;

export const seenPostsIdSchema = yup.array(yup.number());
export type SeenPostsIdType = yup.InferType<typeof seenPostsIdSchema>;

export const htmlProxyQueryParamsSchema = yup.object({
  url: yup.string(),
});

export type HtmlProxyQueryParamsType = yup.InferType<
  typeof htmlProxyQueryParamsSchema
>;

export function extractData(data, schema) {
  try {
    return schema.validateSync(data);
  } catch (e) {
    throw new HttpException(e, HttpStatus.BAD_REQUEST);
  }
}

export function setRedirectInfo({
  response,
  status,
  url,
}: {
  response: any;
  status: number;
  url: string;
}) {
  response.setHeader('Location', url);
  response.statusCode = status;
  return {};
}

export function getUpdateTypeData({
  updateBodyType,
  period,
}: {
  updateBodyType: UPDATE_TYPE;
  period;
}) {
  if (updateBodyType === UPDATE_TYPE.MEDIUM) {
    return {
      resource: PostResources.MEDIUM,
      period: period.WEEK,
    };
  }
  if (updateBodyType === UPDATE_TYPE.HABR) {
    return {
      resource: PostResources.HABR,
      period: period.WEEK,
    };
  }
  if (updateBodyType === UPDATE_TYPE.DEVTO) {
    return {
      resource: PostResources.DEVTO,
      period: period.WEEK,
    };
  }
  if (updateBodyType === UPDATE_TYPE.WEEK) {
    return {
      period: period.WEEK,
    };
  }
  if (updateBodyType === UPDATE_TYPE.MONTH) {
    return {
      period: period.MONTH,
    };
  }
  exhaustiveCheck(updateBodyType);
}
