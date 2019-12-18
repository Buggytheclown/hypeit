import { Injectable } from '@nestjs/common';
import { HabrPostGrabberService } from '../../postGrabbers/habr/habrPostGrabber.service';
import { PostModel } from '../../db/post.service';

@Injectable()
export class PostDeliveryService {
  constructor(
    private readonly habrPostGrabberService: HabrPostGrabberService,
    private readonly postModel: PostModel,
  ) {}

  async saveBestOfTheWeek() {
    const habrData = await this.habrPostGrabberService.getBestOfTheWeek();
    return await this.postModel.savePosts(habrData).catch(e => {
      console.error(e);
      throw e;
    });
  }

  async saveBestOfTheMonth() {
    const habrData = await this.habrPostGrabberService.getBestOfTheMonth();
    return await this.postModel.savePosts(habrData).catch(e => {
      console.error(e);
      throw e;
    });
  }
}
