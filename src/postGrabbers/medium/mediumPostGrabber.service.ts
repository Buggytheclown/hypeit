import { Injectable } from '@nestjs/common';
import { MediumParserService } from './mediumParser.service';
import { MediumHttpService } from './mediumHttp.service';
import {
  MediumPostData,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import { writeData } from '../../helpers/helpers';

export interface MediumResourses {
  posts: MediumPostData[];
  resource: PostResources.MEDIUM;
}

function wrapAsResource<T>(
  data: T,
): {
  posts: T;
  resource: PostResources.MEDIUM;
} {
  return { posts: data, resource: PostResources.MEDIUM };
}

// TODO: increase limit
// TODO: split big limit into smaller(max 25 posts)

@Injectable()
export class MediumPostGrabberService {
  constructor(
    private readonly mediumParserService: MediumParserService,
    private readonly mediumHttpService: MediumHttpService,
  ) {}

  async getBestOfTheWeek(): Promise<MediumResourses> {
    const rawData = await this.mediumHttpService
      .getBestOfTheWeek(25)
      .then(writeData);
    return wrapAsResource(this.mediumParserService.parse(rawData));
  }

  async getBestOfTheMonth(): Promise<MediumResourses> {
    const rawData = await this.mediumHttpService.getBestOfTheMonth(25);
    return wrapAsResource(this.mediumParserService.parse(rawData));
  }
}
