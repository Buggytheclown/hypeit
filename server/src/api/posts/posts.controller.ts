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
} from '@nestjs/common';
import { PostModel } from '../../db/postModel.service';
import {
  extractData,
  seenPostsIdSchema,
  SeenPostsIdType,
} from '../../app.controller.helpers';
import * as moment from 'moment';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { PostRequestDto } from './dto/post.dto';
import {
  postsRequestParamsSchema,
  IPostsRequestParamsSchema,
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
  async getPosts(@Req() request: any): Promise<any> {
    console.log(request, 'request');
    console.log(request.page, 'requestrequest, bestof');
    console.log(request.bestof, 'requestrequest, request.bestof');
    console.log(request.isNextPage, 'requestrequest, isNextPage');
    console.log(request.tagName, 'requestrequest, tagName');
    console.log(request.session, 'requestrequest, session');

    const queryParams: IPostsRequestParamsSchema = extractData(
      request.body,
      postsRequestParamsSchema,
    );

    console.log(queryParams, 'queryParams');

    // if (
    //   queryParams.isNextPage &&
    //   request.session.user &&
    //   request.session.seenPostsId
    // ) {
    //   const seenPostsId: SeenPostsIdType = extractData(
    //     request.session.seenPostsId,
    //     seenPostsIdSchema,
    //   );

    //   await this.postModel.saveSeenPosts({
    //     postsId: seenPostsId as number[],
    //     userId: request.session.user.user_id,
    //     date: moment()
    //       .utcOffset(0)
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   });
    // }

    // const postsPerPage = 10;
    // const posts = await this.postModel.getPosts({
    //   limit: postsPerPage,
    //   lastXDays: queryParams.bestof,
    //   offset: postsPerPage * (queryParams.page - 1),
    //   userId: request.session.user?.user_id,
    //   onlyNotSeen: !!request.session.user?.user_id,
    //   tagName: queryParams.tagName,
    // });

    // if (request.session.user) {
    //   request.session.seenPostsId = posts.map(({ posts_id }) => posts_id);
    // }

    //   response
    //   posts: [
    //       {
    //           bookmarked: false,
    //           tags: ['github', 'git', 'programming', 'c++'],
    //           resources_id: 1,
    //           rating: 5,
    //           externalID: '508020',
    //           imageLink: null,
    //           link: 'https://habr.com/en/post/508020/',
    //           rawTime: 'today at 01:21 PM',
    //           time: '2020-06-24 10:21:00',
    //           title: 'Использование GitHub Actions с C++ и CMake',
    //           posts_id: 356,
    //           resources: картинка на тип источника новости
    //       }
    //   ]
    //   totalPosts
    //   totalSeenPosts ?
    //       params : {
    //           isNextPage: false,
    //           bestof?: 1,
    //           page: 1
    //       }
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
