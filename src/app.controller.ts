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

// TODO: add saveBest posts as a stream, to fetch for ~5 pages->parse->save
// TODO: update parsing process in real time
// TODO: autorise
// TODO: bookmark
// TODO: hide watched posts

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

    const postsPerPage = 10;

    const posts = await this.postModel.getPosts({
      limit: postsPerPage,
      lastXDays: queryParams.bestof,
      offset: postsPerPage * (queryParams.page - 1),
    });

    const resources = await this.postModel.getResources().then(res =>
      res.reduce(
        (acc, { resources_id, favicon }) => ({
          ...acc,
          [resources_id]: favicon,
        }),
        {},
      ),
    );

    return {
      posts,
      queryParams,
      totalPosts: await this.postModel.countPosts({
        lastXDays: queryParams.bestof,
      }),
      currentPage: queryParams.page,
      resources,
    };
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
