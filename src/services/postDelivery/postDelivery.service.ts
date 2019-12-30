import { Injectable } from '@nestjs/common';
import { HabrPostGrabberService } from '../../postGrabbers/habr/habrPostGrabber.service';
import { PostModel } from '../../db/post.service';
import { MediumPostGrabberService } from '../../postGrabbers/medium/mediumPostGrabber.service';
import { DevtoPostGrabberService } from '../../postGrabbers/devto/devtoPostGrabber.service';

@Injectable()
export class PostDeliveryService {
  constructor(
    private readonly habrPostGrabberService: HabrPostGrabberService,
    private readonly mediumPostGrabberService: MediumPostGrabberService,
    private readonly devtoPostGrabberService: DevtoPostGrabberService,
    private readonly postModel: PostModel,
  ) {}

  async saveBestOfTheWeek() {
    await this.saveHabrBestOfTheWeek();
    await this.saveDevtoBestOfTheWeek();
    return await this.saveMediumBestOfTheWeek();
  }

  async saveHabrBestOfTheWeek() {
    const habrData = await this.habrPostGrabberService.getBestOfTheWeek();
    return await this.postModel.savePosts(habrData);
  }

  async saveBestOfTheMonth() {
    await this.saveHabrBestOfTheMonth();
    await this.saveDevtoBestOfTheMonth();
    return await this.saveMediumBestOfTheMonth();
  }

  async saveMediumBestOfTheWeek() {
    const mediumData = await this.mediumPostGrabberService.getBestOfTheWeek();
    return await this.postModel.savePosts(mediumData);
  }

  async saveDevtoBestOfTheWeek() {
    const data = await this.devtoPostGrabberService.getBestOfTheWeek();
    return await this.postModel.savePosts(data);
  }

  async saveHabrBestOfTheMonth() {
    const habrData = await this.habrPostGrabberService.getBestOfTheMonth();
    return await this.postModel.savePosts(habrData);
  }

  async saveMediumBestOfTheMonth() {
    const mediumData = await this.mediumPostGrabberService.getBestOfTheMonth();
    return await this.postModel.savePosts(mediumData);
  }

  async saveDevtoBestOfTheMonth() {
    const data = await this.devtoPostGrabberService.getBestOfTheMonth();
    return await this.postModel.savePosts(data);
  }
}
