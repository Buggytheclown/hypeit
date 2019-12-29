import { Injectable } from '@nestjs/common';
import { MediumParserService } from './mediumParser.service';
import { MediumHttpService } from './mediumHttp.service';
import {
  MediumPostData,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import { MediumRawData } from './medium.interface';
import * as _ from 'lodash';

export interface MediumResourses {
  posts: MediumPostData[];
  resource: PostResources.MEDIUM;
}

function proceedPosts(
  rawPosts: Promise<MediumRawData[]>,
  mediumParserService: MediumParserService,
): Promise<{
  posts: MediumPostData[];
  resource: PostResources.MEDIUM;
}> {
  return rawPosts
    .then(pages => pages.map(mediumParserService.parse))
    .then(_.flatten)
    .then(posts => ({ posts, resource: PostResources.MEDIUM }));
}

@Injectable()
export class MediumPostGrabberService {
  constructor(
    private readonly mediumParserService: MediumParserService,
    private readonly mediumHttpService: MediumHttpService,
  ) {}

  async getBestOfTheWeek(): Promise<MediumResourses> {
    return proceedPosts(
      this.mediumHttpService.getBestOfTheWeek(),
      this.mediumParserService,
    );
  }

  async getBestOfTheMonth(): Promise<MediumResourses> {
    return proceedPosts(
      this.mediumHttpService.getBestOfTheMonth(),
      this.mediumParserService,
    );
  }
}
