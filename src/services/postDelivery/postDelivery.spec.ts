import { Test, TestingModule } from '@nestjs/testing';
import { PostDeliveryService } from './postDelivery.service';
import { PostDeliveryModule } from './postDelivery.module';
import { PostModel } from '../../db/post.service';
import { habrData } from './postsFromDB.mock';
import { DBConnection } from '../../db/dBConnection.service';

// TODO: add "view" layer for posts
// TODO: update post if exists (rating)

describe('postDelivery test', () => {
  let postDeliveryService: PostDeliveryService;
  let postModel: PostModel;
  let dBConnection: DBConnection;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [PostDeliveryModule],
      providers: [],
    }).compile();

    postDeliveryService = app.get<PostDeliveryService>(PostDeliveryService);
    postModel = app.get<PostModel>(PostModel);
    dBConnection = app.get<DBConnection>(DBConnection);
  });

  it('postDelivery', async () => {
    await postDeliveryService.saveBestOfTheWeeks();
    const posts = await postModel.getPosts();
    expect(posts).toEqual(habrData);
  });
});
