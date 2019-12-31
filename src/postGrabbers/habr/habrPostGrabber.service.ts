import { Injectable } from '@nestjs/common';
import { HabrParserService } from './habrParser.service';
import {
  HabrPostData,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import { HabrHttpService } from './habrHttp.service';

function proceedPosts(
  rawPosts: Promise<string[]>,
  habrParserService: HabrParserService,
): Promise<{
  posts: HabrPostData[];
  resource: PostResources.HABR;
}> {
  return rawPosts
    .then(pages => pages.map(habrParserService.parse))
    .then(_.flatten)
    .then(posts => ({ posts, resource: PostResources.HABR }));
}

export interface HabrResourses {
  posts: HabrPostData[];
  resource: PostResources.HABR;
}

@Injectable()
export class HabrPostGrabberService {
  constructor(
    private readonly habrParserService: HabrParserService,
    private readonly habrHttpService: HabrHttpService,
  ) {}

  getBestOfTheWeek(): Promise<{
    posts: HabrPostData[];
    resource: PostResources.HABR;
  }> {
    return proceedPosts(
      this.habrHttpService.getBestOfTheWeek(10),
      this.habrParserService,
    );
  }

  getBestOfTheMonth(): Promise<{
    posts: HabrPostData[];
    resource: PostResources.HABR;
  }> {
    return proceedPosts(
      this.habrHttpService.getBestOfTheMonth(30),
      this.habrParserService,
    );
  }
}
