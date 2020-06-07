import { Injectable } from '@nestjs/common';
import { HabrParserService } from './habrParser.service';
import {
  HabrPostData,
  PostGrabber,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import { HabrHttpService } from './habrHttp.service';
import { CustomLoggerService } from '../../services/logger/customLogger.service';
import { isSorted } from '../../helpers/helpers';

function proceedPosts(
  rawPosts: Promise<string[]>,
  habrParserService: HabrParserService,
  ensureSorted: (el: HabrPostData[]) => HabrPostData[],
): Promise<{
  posts: HabrPostData[];
  resource: PostResources.HABR;
}> {
  return rawPosts
    .then(pages => pages.map(habrParserService.parse))
    .then(_.flatten)
    .then(ensureSorted)
    .then(posts => ({ posts, resource: PostResources.HABR }));
}

export interface HabrResourses {
  posts: HabrPostData[];
  resource: PostResources.HABR;
}

@Injectable()
export class HabrPostGrabberService implements PostGrabber {
  resource = PostResources.HABR;

  constructor(
    private readonly habrParserService: HabrParserService,
    private readonly habrHttpService: HabrHttpService,
    private readonly cls: CustomLoggerService,
  ) {}

  private _ensureSorted = <T extends { totalVotes: number }>(
    posts: T[],
  ): T[] => {
    if (!isSorted(posts, { extractor: post => post.totalVotes })) {
      this.cls.warn('HabrPostGrabberService: posts are not sorted');
    }
    return posts;
  };

  getBestOfTheWeek = (): Promise<{
    posts: HabrPostData[];
    resource: PostResources.HABR;
  }> => {
    return proceedPosts(
      this.habrHttpService.getBestOfTheWeek(10),
      this.habrParserService,
      this._ensureSorted,
    );
  };

  getBestOfTheMonth = (): Promise<{
    posts: HabrPostData[];
    resource: PostResources.HABR;
  }> => {
    return proceedPosts(
      this.habrHttpService.getBestOfTheMonth(30),
      this.habrParserService,
      this._ensureSorted,
    );
  };
}
