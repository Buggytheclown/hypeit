import { Injectable } from '@nestjs/common';
import { MediumParserService } from './mediumParser.service';
import { MediumHttpService } from './mediumHttp.service';
import {
  MediumPostData,
  PostGrabber,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import { MediumRawData } from './medium.interface';
import * as _ from 'lodash';
import { CustomLoggerService } from '../../services/logger/customLogger.service';
import { isSorted } from '../../helpers/helpers';

export interface MediumResourses {
  posts: MediumPostData[];
  resource: PostResources.MEDIUM;
}

function proceedPosts(
  rawPosts: Promise<MediumRawData[]>,
  mediumParserService: MediumParserService,
  ensureSorted: (els: MediumPostData[]) => MediumPostData[],
): Promise<{
  posts: MediumPostData[];
  resource: PostResources.MEDIUM;
}> {
  return rawPosts
    .then(pages => pages.map(mediumParserService.parse))
    .then(_.flatten)
    .then(ensureSorted)
    .then(posts => ({ posts, resource: PostResources.MEDIUM }));
}

@Injectable()
export class MediumPostGrabberService implements PostGrabber {
  resource = PostResources.MEDIUM;

  constructor(
    private readonly mediumParserService: MediumParserService,
    private readonly mediumHttpService: MediumHttpService,
    private readonly cls: CustomLoggerService,
  ) {}

  private _ensureSorted = <T extends { clapCount: number }>(
    posts: T[],
  ): T[] => {
    if (!isSorted(posts, { extractor: post => post.clapCount })) {
      this.cls.warn('MediumPostGrabberService: posts are not sorted');
    }
    return posts;
  };

  getBestOfTheWeek = async (): Promise<MediumResourses> => {
    return proceedPosts(
      this.mediumHttpService.getBestOfTheWeek(),
      this.mediumParserService,
      this._ensureSorted,
    );
  };

  getBestOfTheMonth = async (): Promise<MediumResourses> => {
    return proceedPosts(
      this.mediumHttpService.getBestOfTheMonth(),
      this.mediumParserService,
      this._ensureSorted,
    );
  };
}
