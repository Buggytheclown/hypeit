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
import { PostModel } from './db/postModel.service';
import { exhaustiveCheck } from './helpers/helpers';
import { UserModelService } from './db/userModel.service';
import { finalize } from 'rxjs/operators';
import { ProxyService } from './services/htmlproxy/proxy.service';
import {
  AUTH_TYPE,
  authBodySchema,
  AuthBodyType,
  BasicPostPageData,
  BasicTemplateData,
  extractData,
  getUpdateTypeData,
  HideEventkBody,
  hideEventkBodySchema,
  htmlProxyQueryParamsSchema,
  HtmlProxyQueryParamsType,
  PostsBookmarkBody,
  postsBookmarkBodySchema,
  postsQueryParamsSchema,
  PostsQueryParamsType,
  REDIRECT_TYPE,
  redirectQueryParamsSchema,
  RedirectQueryParamsType,
  seenPostsIdSchema,
  SeenPostsIdType,
  setRedirectInfo,
  UPDATE_TYPE,
  updateBodySchema,
  UpdateBodyType,
} from './app.controller.helpers';
import { DevbyEventsGrabberService } from './eventGrabbers/devby/devbyEventsGrabber.service';
import { EventModelService } from './db/eventModel.service';

@Controller()
export class AppController {
  constructor(
    private readonly postDeliveryService: PostDeliveryService,
    private readonly postModel: PostModel,
    private readonly userModelService: UserModelService,
    private readonly proxyService: ProxyService,
    private readonly devbyEventsService: DevbyEventsGrabberService,
    private readonly eventModelService: EventModelService,
  ) {}

  @Get('/')
  @Render('index')
  async getPosts(
    @Req() request,
    @Query() query: unknown,
  ): Promise<BasicPostPageData & BasicTemplateData> {
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
      onlyNotSeen: !!request.session.user?.user_id,
      tagName: queryParams.tagName,
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
      events:
        request.url === '/'
          ? await this.eventModelService.getEvents({
              featureXDays: 14,
              ...(request.session.user && {
                onlyNotSeen: true,
                userId: request.session.user.user_id,
              }),
            })
          : [],
    };
  }

  @Get('/auth')
  @Render('auth')
  async getAuth(
    @Req() request,
    @Res() response: any,
  ): Promise<BasicTemplateData> {
    if (request.session.user) {
      return setRedirectInfo({ response, status: 303, url: `/` });
    }
    return {
      url: '/auth',
      user: null,
    };
  }

  @Post('/auth')
  @Render('auth')
  async postAuth(
    @Req() request: any,
    @Res() response: any,
  ): Promise<BasicTemplateData> {
    const body: AuthBodyType = extractData(request.body, authBodySchema);
    const formType: AUTH_TYPE = body.form_type;

    const userData = {
      name: body.username,
      password: body.password,
    };

    if (formType === AUTH_TYPE.REGISTER) {
      if (await this.userModelService.isUsernameExist(userData)) {
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
      await this.userModelService.saveUser(userData);

      request.session.user = await this.userModelService.getVerifiedUser(
        userData,
      );

      return setRedirectInfo({ response, status: 303, url: `/` });
    }

    if (formType === AUTH_TYPE.LOGIN) {
      const user = await this.userModelService.getVerifiedUser(userData);
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
  async getBookmarked(
    @Req() request,
  ): Promise<BasicPostPageData & BasicTemplateData> {
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
      events: [],
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
          response.write(`<pre>---DONE---</pre> \n`);
          response.end();
        }),
      )
      .subscribe(data =>
        response.write(`<pre>${(JSON.stringify as any)(data, 4, 4)}</pre> \n`),
      );
  }

  @Get('/about')
  @Render('about')
  async getAbout(@Req() request): Promise<BasicTemplateData> {
    return {
      user: request.session.user,
      url: '/about',
    };
  }

  @Get('/htmlproxy')
  async getHtmlProxy(@Req() request, @Query() query: unknown) {
    const queryParams: HtmlProxyQueryParamsType = extractData(
      query,
      htmlProxyQueryParamsSchema,
    );

    return this.proxyService.proxyHtml(queryParams.url);
  }

  @Get('/proxy')
  async getProxy(@Req() request, @Query() query: unknown) {
    const queryParams: HtmlProxyQueryParamsType = extractData(
      query,
      htmlProxyQueryParamsSchema,
    );

    return this.proxyService.proxy(queryParams.url);
  }

  @Get('/redirect')
  async getRedirect(
    @Req() request,
    @Query() query: unknown,
    @Res() response: any,
  ) {
    const queryParams: RedirectQueryParamsType = extractData(
      query,
      redirectQueryParamsSchema,
    );

    let link;
    try {
      link = await this.postModel.getPostLink({
        postId: queryParams.postId,
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.NOT_FOUND);
    }

    if (request.session.user && link) {
      this.postModel.saveOpenedPost({
        userId: request.session.user.user_id,
        postId: queryParams.postId,
      });
    }

    if (queryParams.redirectType === REDIRECT_TYPE.DIRECT) {
      setRedirectInfo({ response, status: 303, url: link });
      response.end();
    } else if (queryParams.redirectType === REDIRECT_TYPE.HTMLPROXY) {
      setRedirectInfo({ response, status: 303, url: `/htmlproxy?url=${link}` });
      response.end();
    } else {
      exhaustiveCheck(queryParams.redirectType);
    }
  }

  @Get('stats/users')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getStatsUsers() {
    return this.userModelService
      .getUsers()
      .then(users =>
        users
          .map(user => `<pre>${(JSON.stringify as any)(user, 4, 4)}</pre> \n`)
          .join('\n'),
      );
  }

  @Get('/contacts')
  @Render('contacts')
  async getContacts(@Req() request): Promise<BasicTemplateData> {
    return {
      user: request.session.user,
      url: '/contacts',
    };
  }

  @Post('/events/hide')
  async toggleSeenEvents(@Req() request: any) {
    if (!request.session.user) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const body: HideEventkBody = extractData(
      request.body,
      hideEventkBodySchema,
    );

    if (!body.hide) {
      throw new HttpException(
        'UNIMPLEMENTED: can only hide events',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.eventModelService.saveSeenEvents({
      userId: request.session.user.user_id,
      eventsId: [body.eventId],
    });
  }
}
