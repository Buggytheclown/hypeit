import { Injectable } from '@nestjs/common';
import { HabrPostGrabberService } from '../../postGrabbers/habr/habrPostGrabber.service';
import { PostModel } from '../../db/post.service';

@Injectable()
export class PostDeliveryService {
  constructor(
    private readonly habrPostGrabberService: HabrPostGrabberService,
    private readonly postModel: PostModel,
  ) {}

  async saveBestOfTheWeeks() {
    const habrData = await this.habrPostGrabberService.getBestOfTheWeek();
    await this.postModel.savePosts(habrData).catch(console.error);
  }
}
