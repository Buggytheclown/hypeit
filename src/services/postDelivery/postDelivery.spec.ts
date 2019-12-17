import { Test, TestingModule } from '@nestjs/testing';
import { PostDeliveryService } from './postDelivery.service';
import { PostDeliveryModule } from './postDelivery.module';
import { PostModel } from '../../db/post.service';
import { habrData } from './postsFromDB.mock';

// TODO: add "view" layer for posts
// TODO: update post if exists (rating)

describe('postDelivery test', () => {
  let postDeliveryService: PostDeliveryService;
  let postModel: PostModel;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [PostDeliveryModule],
      providers: [],
    }).compile();

    postDeliveryService = app.get<PostDeliveryService>(PostDeliveryService);
    postModel = app.get<PostModel>(PostModel);
  });

  it('postDelivery', async () => {
    await postDeliveryService.saveBestOfTheWeeks();
    const { results } = await postModel.getPosts();
    expect(results).toEqual(habrData);
  });
});
