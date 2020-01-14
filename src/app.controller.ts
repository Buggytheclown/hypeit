import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { PostDeliveryService } from './services/postDelivery/postDelivery.service';
import { PostModel } from './db/post.service';
import * as yup from 'yup';
import { exhaustiveCheck } from './helpers/helpers';
import { UserService } from './db/user.service';
import { finalize } from 'rxjs/operators';
import { PostResources } from './services/postDelivery/post.interfaces';

const postsQueryParamsSchema = yup.object({
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

type PostsQueryParamsType = yup.InferType<typeof postsQueryParamsSchema>;

enum AUTH_TYPE {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
}

const postsBookmarkBodySchema = yup.object({
  postId: yup.number().required(),
  bookmark: yup.boolean().required(),
});

type PostsBookmarkBody = yup.InferType<typeof postsBookmarkBodySchema>;

const authBodySchema = yup.object({
  form_type: yup.mixed().oneOf([AUTH_TYPE.LOGIN, AUTH_TYPE.REGISTER]),
  username: yup.string().min(3),
  password: yup.string().min(5),
  password2: yup.string().min(5),
});
type AuthBodyType = yup.InferType<typeof authBodySchema>;

enum UPDATE_TYPE {
  DEVTO = 'DEVTO',
  MEDIUM = 'MEDIUM',
  HABR = 'HABR',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}
const updateBodySchema = yup.object({
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
type UpdateBodyType = yup.InferType<typeof updateBodySchema>;

const seenPostsIdSchema = yup.array(yup.number());
type SeenPostsIdType = yup.InferType<typeof seenPostsIdSchema>;

function extractData(data, schema) {
  try {
    return schema.validateSync(data);
  } catch (e) {
    throw new HttpException(e, HttpStatus.BAD_REQUEST);
  }
}

function setRedirectInfo({
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

function getUpdateTypeData({
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

@Controller()
export class AppController {
  constructor(
    private readonly postDeliveryService: PostDeliveryService,
    private readonly postModel: PostModel,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  @Render('index')
  async getPosts(@Req() request, @Query() query: unknown) {
    const queryParams: PostsQueryParamsType = extractData(
      query,
      postsQueryParamsSchema,
    );

    if (
      queryParams.isNextPage &&
      request.session.user &&
      request.session.seenPostsId
    ) {
      const seenPostsId: SeenPostsIdType = extractData(
        request.session.seenPostsId,
        seenPostsIdSchema,
      );

      await this.postModel.saveSeenPosts({
        postsId: seenPostsId as number[],
        userId: request.session.user.user_id,
      });
    }

    const postsPerPage = 10;
    const posts = await this.postModel.getPosts({
      limit: postsPerPage,
      lastXDays: queryParams.bestof,
      offset: postsPerPage * (queryParams.page - 1),
      userId: request.session.user?.user_id,
      onlyNotSeen: true,
    });

    if (request.session.user) {
      request.session.seenPostsId = posts.map(({ posts_id }) => posts_id);
    }

    return {
      posts,
      queryParams,
      totalPosts: await this.postModel.countPosts({
        lastXDays: queryParams.bestof,
      }),
      totalSeenPosts: request.session.user
        ? await this.postModel.countSeenPosts({
            lastXDays: queryParams.bestof,
            userId: request.session.user.user_id,
          })
        : postsPerPage * (queryParams.page - 1),
      currentPage: queryParams.page,
      resources: await this.postModel.getResourcesMap(),
      user: request.session.user,
      url: '/',
    };
  }

  @Get('/auth')
  @Render('auth')
  async getAuth(@Req() request, @Res() response: any) {
    if (request.session.user) {
      return setRedirectInfo({ response, status: 303, url: `/` });
    }
    return {};
  }

  @Post('/auth')
  @Render('auth')
  async postAuth(@Req() request: any, @Res() response: any) {
    const body: AuthBodyType = extractData(request.body, authBodySchema);
    const formType: AUTH_TYPE = body.form_type;

    const userData = {
      name: body.username,
      password: body.password,
    };

    if (formType === AUTH_TYPE.REGISTER) {
      if (await this.userService.isUsernameExist(userData)) {
        throw new HttpException(
          'Username is already taken',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (userData.password !== body.password2) {
        throw new HttpException(
          'password does not match',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.userService.saveUser(userData);

      request.session.user = await this.userService.getVerifiedUser(userData);

      return setRedirectInfo({ response, status: 303, url: `/` });
    }

    if (formType === AUTH_TYPE.LOGIN) {
      const user = await this.userService.getVerifiedUser(userData);
      if (!user) {
        throw new HttpException(
          'Username or password is incorrect',
          HttpStatus.BAD_REQUEST,
        );
      }
      request.session.user = user;

      return setRedirectInfo({ response, status: 303, url: `/` });
    }

    exhaustiveCheck(formType);
  }

  @Post('/auth/logout')
  async logout(@Req() request: any) {
    return new Promise((res, rej) => {
      request.session.destroy((err => {
        if (err) {
          rej(err);
        } else {
          setRedirectInfo({ response: request.res, status: 303, url: `/` });
          res();
        }
      }) as any);
    });
  }

  @Post('/posts/bookmark')
  async toggleBookmark(@Req() request: any) {
    if (!request.session.user) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const body: PostsBookmarkBody = extractData(
      request.body,
      postsBookmarkBodySchema,
    );

    await this.postModel.toggleBookmarked({
      userId: request.session.user.user_id,
      postId: body.postId,
      bookmark: body.bookmark,
    });
  }

  @Get('/bookmarked')
  @Render('index')
  async getBookmarked(@Req() request) {
    if (!request.session.user) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const posts = await this.postModel.getPosts({
      userId: request.session.user.user_id,
      onlyBookmarked: true,
    });

    return {
      posts,
      queryParams: {},
      totalPosts: posts.length,
      totalSeenPosts: 0,
      currentPage: 1,
      resources: await this.postModel.getResourcesMap(),
      user: request.session.user,
      url: '/bookmarked',
    };
  }

  @Get('/update')
  @Render('update')
  async getUpdate() {
    return {};
  }

  @Post('/update')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Transfer-Encoding', 'chunked')
  async update(@Req() request, @Query() query: unknown, @Res() response: any) {
    const body: UpdateBodyType = extractData(request.body, updateBodySchema);
    const updateBodyType: UPDATE_TYPE = body.update_type;

    this.postDeliveryService
      .updatePosts(
        getUpdateTypeData({
          updateBodyType,
          period: this.postDeliveryService.period,
        }),
      )
      .pipe(
        finalize(() => {
          response.end();
        }),
      )
      .subscribe(data =>
        response.write(`<pre>${(JSON.stringify as any)(data, 4, 4)}</pre> \n`),
      );
  }

  @Get('/about')
  @Render('about')
  async getAbout(@Req() request) {
    return {
      user: request.session.user,
    };
  }
}
