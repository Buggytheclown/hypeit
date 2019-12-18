import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { habrData1 } from './habrData1.mock';
import { HabrParserService } from './habrParser.service';
import {
  PostData,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import { HabrHttpService } from './habrHttp.service';

function proceedPosts(rawPosts: Promise<string[]>, habrParserService: HabrParserService) {
  return rawPosts
    .then(pages => pages.map(habrParserService.parse))
    .then(_.flatten)
    .then(posts => ({ posts, resource: PostResources.HABR }));
}

@Injectable()
export class HabrPostGrabberService {
  constructor(
    private readonly habrParserService: HabrParserService,
    private readonly habrHttpService: HabrHttpService,
  ) {}

  getBestOfTheWeek(): Promise<{ posts: PostData[]; resource: PostResources }> {
    return proceedPosts(this.habrHttpService.getBestOfTheWeek(10), this.habrParserService);
  }

  getBestOfTheMonth(): Promise<{ posts: PostData[]; resource: PostResources }> {
    return proceedPosts(this.habrHttpService.getBestOfTheMonth(20), this.habrParserService);
  }
}
