import { Injectable } from '@nestjs/common';
import {
  DevtoPostData,
  PostGrabber,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import { DevtoHttpService } from './devtoHttp.service';
import { DevtoParserService } from './devtoParser.service';
import { isSorted } from '../../helpers/helpers';
import { CustomLoggerService } from '../../services/logger/customLogger.service';

export interface DevtoResourses {
  posts: DevtoPostData[];
  resource: PostResources.DEVTO;
}

function wrapAsResources<T>(
  posts: T[],
): {
  posts: T[];
  resource: PostResources.DEVTO;
} {
  return {
    posts,
    resource: PostResources.DEVTO,
  };
}

@Injectable()
export class DevtoPostGrabberService implements PostGrabber {
  resource = PostResources.DEVTO;

  constructor(
    private readonly devtoHttpService: DevtoHttpService,
    private readonly devtoParserService: DevtoParserService,
    private readonly cls: CustomLoggerService,
  ) {}

  private _ensureSorted<T extends { score: number }>(posts: T[]): T[] {
    if (!isSorted(posts, { extractor: post => post.score })) {
      this.cls.warn('DevtoPostGrabberService: posts are not sorted');
    }
    return posts;
  }

  getBestOfTheWeek = async (): Promise<DevtoResourses> => {
    return wrapAsResources(
      this._ensureSorted(
        this.devtoParserService.parse(
          await this.devtoHttpService.getBestOfTheWeek(),
        ),
      ),
    );
  };

  getBestOfTheMonth = async (): Promise<DevtoResourses> => {
    return wrapAsResources(
      this.devtoParserService.parse(
        await this.devtoHttpService.getBestOfTheMonth(),
      ),
    );
  };
}
