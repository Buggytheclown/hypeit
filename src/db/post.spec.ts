import { Test, TestingModule } from '@nestjs/testing';
import { DbModule } from './db.module';
import { PostModel } from './post.service';
import { postsMock } from './posts.mock';
import { PostResources } from '../services/postDelivery/post.interfaces';
import * as _ from 'lodash';

function withSortedTags(posts) {
  return posts.map(post => ({ ...post, tags: post.tags.slice().sort() }));
}

describe('post model test', () => {
  let postModel: PostModel;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DbModule],
    }).compile();

    postModel = app.get<PostModel>(PostModel);
  });

  it('postDelivery', async done => {
    await postModel.savePosts({
      posts: postsMock,
      resource: PostResources.HABR,
    });
    const posts = await postModel.getPosts();
    expect(withSortedTags(posts)).toEqual(
      withSortedTags(
        postsMock.map(post => ({
          ..._.omit(post, ['totalVotes', 'totalViews']),
          resources_id: 1,
        })),
      ),
    );

    done();
  });
});
