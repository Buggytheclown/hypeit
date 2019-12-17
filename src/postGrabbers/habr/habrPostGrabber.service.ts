import { Injectable } from '@nestjs/common';
// import fetch from 'node-fetch';
import { habrMock } from './habrData1.mock';
import { HabrParserService } from './habrParser.service';
import {
  PostData,
  PostResources,
} from '../../services/postDelivery/post.interfaces';

@Injectable()
export class HabrPostGrabberService {
  constructor(private readonly habrParserService: HabrParserService) {}

  getBestOfTheWeek(): Promise<{ posts: PostData[]; resource: PostResources }> {
    // return fetch('https://habr.com/en/flows/develop/top/')
    // https://habr.com/en/flows/develop/top/page2/
    // https://habr.com/en/flows/develop/top/monthly/page2/
    //   .then(res => res.text())

    return Promise.resolve(habrMock)
      .then(this.habrParserService.parse)
      .then(posts => ({ posts, resource: PostResources.HABR }));
  }
}
