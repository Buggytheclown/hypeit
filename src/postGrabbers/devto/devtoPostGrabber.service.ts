import { Injectable } from '@nestjs/common';
import {
  DevtoPostData,
  PostGrabber,
  PostResources,
} from '../../services/postDelivery/post.interfaces';
import { DevtoHttpService } from './devtoHttp.service';
import { DevtoParserService } from './devtoParser.service';

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
  ) {}

  getBestOfTheWeek = async (): Promise<DevtoResourses> => {
    return wrapAsResources(
      this.devtoParserService.parse(
        await this.devtoHttpService.getBestOfTheWeek(),
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
