import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Render,
  Req,
} from '@nestjs/common';
import { PostDeliveryService } from './services/postDelivery/postDelivery.service';
import { PostModel } from './db/post.service';
import * as yup from 'yup';

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
});

type postsQueryParamsType = yup.InferType<typeof postsQueryParamsSchema>;

function extractQuery(query) {
  try {
    return postsQueryParamsSchema.validateSync(query);
  } catch (e) {
    throw new HttpException(e, HttpStatus.BAD_REQUEST);
  }
}

@Controller()
export class AppController {
  constructor(
    private readonly postDeliveryService: PostDeliveryService,
    private readonly postModel: PostModel,
  ) {}

  @Get('/')
  @Render('index')
  async getPosts(@Query() query: unknown) {
    const queryParams: postsQueryParamsType = extractQuery(query);

    const posts = await this.postModel.getPosts({
      limit: 20,
      lastXDays: queryParams.bestof,
      offset: 20 * (queryParams.page - 1),
    });

    return {
      posts,
      queryParams,
      totalPosts: await this.postModel.countPosts({
        lastXDays: queryParams.bestof,
      }),
      currentPage: queryParams.page,
      resources: {
        1: 'https://habr.com/images/favicon-32x32.png',
        2: 'https://cdn-static-1.medium.com/_/fp/icons/favicon-rebrand-medium.3Y6xpZ-0FSdWDnPM3hSBIA.ico',
      },
    };
  }

  @Get('/update')
  async updatePosts() {
    await this.postDeliveryService.saveBestOfTheWeek();
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
    await this.postDeliveryService.saveMediumBestOfTheMonth();
    return 'ok';
  }

  @Get('/update/habr')
  async updateHabrPosts() {
    await this.postDeliveryService.saveHabrBestOfTheWeek();
    await this.postDeliveryService.saveHabrBestOfTheMonth();
    return 'ok';
  }
}
