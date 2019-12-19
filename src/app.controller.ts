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

    return { posts, queryParams };
  }

  @Get('/update')
  async updatePosts() {
    await this.postDeliveryService.saveBestOfTheWeek();
    await this.postDeliveryService.saveBestOfTheMonth();
    return 'ok';
  }
}
