import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import { PostModel } from '../../db/postModel.service';
import {
  extractData,
  seenPostsIdSchema,
  SeenPostsIdType,
} from '../../app.controller.helpers';
import * as moment from 'moment';
import { Request } from 'express';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { PostRequestDto } from './dto/post.dto';
import {
  postsRequestParamsSchema,
  TPostsRequestParamsSchema,
} from './posts.controller.helpers';

/**
    TODO
    1. resources - возвращает ссылки на картинки - я предлагаю это сразу в post перенести. {resources_id: number, link: string}
    2. rawTime, url, externalID, link - на фронте не используется
    3. user - лучше вынести в отдельный эндпоинт
    4. Возможно стоит совместить bookmarked и posts - так как сущности одни и те же и добавить только флаг при запросе.
 */

@Controller()
export class PostController {
  constructor(private readonly postModel: PostModel) {}

  // request
  // userId? - id || undefined
  // lastXDays - days
  // tagName ? - tag || undefined
  // bookmarked ? - true || false
  // isNextPage ? - true || false
  @Post('/api/v1/posts')
  @ApiOperation({ summary: 'Get posts' })
  @ApiBody({ description: 'Request Body', type: PostRequestDto })
  async getPosts(@Req() request: Request): Promise<any> {
    console.log(request, 'request');
    console.log(request.session, 'requestrequest, session');

    const queryParams: TPostsRequestParamsSchema = extractData(
      request.body,
      postsRequestParamsSchema,
    );

    console.log(queryParams, 'queryParams');

    if (
      queryParams.isNextPage &&
      request.session?.user &&
      request.session?.seenPostsId
    ) {
      const seenPostsId: SeenPostsIdType = extractData(
        request.session.seenPostsId,
        seenPostsIdSchema,
      );
      /**  Помечаем в БД помеченные просмотренные посты. Тут нюанс, что если куки почистить и не запросить новые посты, то тогда данные о последних просмотренных постах пропадут. */
      await this.postModel.saveSeenPosts({
        postsId: seenPostsId as number[],
        userId: request.session.user.user_id,
        date: moment()
          .utcOffset(0)
          .format('YYYY-MM-DD HH:mm:ss'),
      });
    }

    const postsPerPage = 10;
    const posts = await this.postModel.getPosts({
      limit: postsPerPage,
      lastXDays: queryParams.lastXDays,
      // Кажется тут решил усложнить тем, чтобы считать в базе данных от просмотренные + postPerPage для следукющей страницы.
      // offset: postsPerPage * (queryParams.page - 1),
      userId: request.session?.user?.user_id,
      onlyNotSeen: !!request.session?.user?.user_id,
      tagName: queryParams.tagName,
    });

    if (request.session?.user) {
      /** Возвращаемые посты сразу помещаем в просмотренные.*/
      request.session.seenPostsId = posts.map(({ posts_id }) => posts_id);
    }
    console.log(posts);

    //   response
    // posts: [
    //     {
    //         bookmarked: false,
    //         tags: ['github', 'git', 'programming', 'c++'],
    //         resources_id: 1,
    //         rating: 5,
    //         externalID: '508020',
    //         imageLink: null,
    //         link: 'https://habr.com/en/post/508020/',
    //         rawTime: 'today at 01:21 PM',
    //         time: '2020-06-24 10:21:00',
    //         title: 'Использование GitHub Actions с C++ и CMake',
    //         posts_id: 356,
    //         resources: картинка на тип источника новости
    //     }
    // ]
    // totalPosts
    // totalSeenPosts ?
    //     params : {
    //         isNextPage: false,
    //         bestof?: 1,
    //         page: 1
    //     }
    // return {
    //   posts,
    //   queryParams,
    //   totalPosts: await this.postModel.countPosts({
    //     lastXDays: queryParams.bestof,
    //     tagName: queryParams.tagName,
    //   }),
    //   totalSeenPosts: request.session.user
    //     ? await this.postModel.countSeenPosts({
    //         lastXDays: queryParams.bestof,
    //         userId: request.session.user.user_id,
    //         tagName: queryParams.tagName,
    //       })
    //     : postsPerPage * (queryParams.page - 1),
    //   resources: await this.postModel.getResourceFaviconsMap(),
    // };
  }
}
