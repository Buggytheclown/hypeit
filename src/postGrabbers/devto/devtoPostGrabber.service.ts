import { Injectable } from '@nestjs/common';
import {
  DevtoPostData,
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
export class DevtoPostGrabberService {
  constructor(
    private readonly devtoHttpService: DevtoHttpService,
    private readonly devtoParserService: DevtoParserService,
  ) {}

  async getBestOfTheWeek(): Promise<DevtoResourses> {
    return wrapAsResources(
      this.devtoParserService.parse(
        await this.devtoHttpService.getBestOfTheWeek(),
      ),
    );
  }

  async getBestOfTheMonth(): Promise<DevtoResourses> {
    return wrapAsResources(
      this.devtoParserService.parse(
        await this.devtoHttpService.getBestOfTheMonth(),
      ),
    );
  }
}
