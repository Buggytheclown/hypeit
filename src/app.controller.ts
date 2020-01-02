import {
  Controller,
  Get,
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

const authBodySchema = yup.object({
  form_type: yup.mixed().oneOf([AUTH_TYPE.LOGIN, AUTH_TYPE.REGISTER]),
  username: yup.string().min(3),
  password: yup.string().min(5),
  password2: yup.string().min(5),
});
type AuthBodyType = yup.InferType<typeof authBodySchema>;

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

  @Get('/update/month')
  async updatePosts() {
    await this.postDeliveryService.saveBestOfTheMonth();
    return 'ok';
  }

  @Get('/update/week')
  async updatePostsForWeek() {
    await this.postDeliveryService.saveBestOfTheWeek();
    return 'ok';
  }

  @Get('/update/medium')
  async updateMediumPosts() {
    await this.postDeliveryService.saveMediumBestOfTheWeek();
    return 'ok';
  }

  @Get('/update/habr')
  async updateHabrPosts() {
    await this.postDeliveryService.saveHabrBestOfTheWeek();
    return 'ok';
  }

  @Get('/update/devto')
  async updateDevtoPosts() {
    await this.postDeliveryService.saveDevtoBestOfTheWeek();
    return 'ok';
  }
}
