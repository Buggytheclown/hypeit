import { Injectable } from '@nestjs/common';
import { HabrPostGrabberService } from '../../postGrabbers/habr/habrPostGrabber.service';
import { PostModel } from '../../db/post.service';
import { MediumPostGrabberService } from '../../postGrabbers/medium/mediumPostGrabber.service';

@Injectable()
export class PostDeliveryService {
  constructor(
    private readonly habrPostGrabberService: HabrPostGrabberService,
    private readonly mediumPostGrabberService: MediumPostGrabberService,
    private readonly postModel: PostModel,
  ) {}

  async saveBestOfTheWeek() {
    await this.saveHabrBestOfTheWeek();
    return await this.saveMediumBestOfTheWeek();
  }

  async saveHabrBestOfTheWeek() {
    const habrData = await this.habrPostGrabberService.getBestOfTheWeek();
    return await this.postModel.savePosts(habrData);
  }

  async saveMediumBestOfTheWeek() {
    const mediumData = await this.mediumPostGrabberService.getBestOfTheWeek();
    return await this.postModel.savePosts(mediumData);
  }

  async saveBestOfTheMonth() {
    await this.saveHabrBestOfTheMonth();
    return await this.saveMediumBestOfTheMonth();
  }

  async saveHabrBestOfTheMonth() {
    const habrData = await this.habrPostGrabberService.getBestOfTheMonth();
    return await this.postModel.savePosts(habrData);
  }

  async saveMediumBestOfTheMonth() {
    const mediumData = await this.mediumPostGrabberService.getBestOfTheMonth();
    return await this.postModel.savePosts(mediumData);
  }
}
