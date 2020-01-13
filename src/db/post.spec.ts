import { Test, TestingModule } from '@nestjs/testing';
import { DbModule } from './db.module';
import { PostModel } from './post.service';
import { postsMocks } from './posts.mock';
import { PostResources } from '../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import { AppModule } from '../app.module';

function withSortedTags(posts) {
  return posts.map(post => ({ ...post, tags: post.tags.slice().sort() }));
}

function withSortedPosts(posts) {
  return _.sortBy(posts, [o => o.externalID]);
}

function withClearedMediumRatingInfo(posts) {
  return posts.map(post => ({
    ..._.omit(post, ['clapCount', 'voterCount']),
    resources_id: 2,
  }));
}

function withClearedHabrRatingInfo(posts) {
  return posts.map(post => ({
    ..._.omit(post, ['totalVotes', 'totalViews']),
    resources_id: 1,
  }));
}

function withClearedDevtoRatingInfo(posts) {
  return posts.map(post => ({
    ..._.omit(post, ['score']),
    resources_id: 3,
  }));
}
const prepareDbPosts = _.flow([withSortedPosts, withSortedTags]);

const prepareMockMediumPosts = _.flow([
  post => _.uniqBy(post, (el: { externalID: string }) => el.externalID),
  withSortedPosts,
  withSortedTags,
  withClearedMediumRatingInfo,
]);

const prepareMockHabrPosts = _.flow([
  post => _.uniqBy(post, (el: { externalID: string }) => el.externalID),
  withSortedPosts,
  withSortedTags,
  withClearedHabrRatingInfo,
]);

const prepareMockDevtoPosts = _.flow([
  post => _.uniqBy(post, (el: { externalID: string }) => el.externalID),
  withSortedPosts,
  withSortedTags,
  withClearedDevtoRatingInfo,
]);

describe('post model test', () => {
  let postModel: PostModel;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    postModel = app.get<PostModel>(PostModel);
  });

  afterEach(async () => postModel.deleteAllPosts());

  it('postDelivery should insert HABR posts', async done => {
    await postModel.savePosts({
      posts: postsMocks.habr,
      resource: PostResources.HABR,
    });

    const posts = await postModel.getPosts();

    expect(prepareDbPosts(posts)).toEqual(
      prepareMockHabrPosts(postsMocks.habr),
    );
    done();
  });

  it('postDelivery should insert MEDIUM posts', async done => {
    await postModel.savePosts({
      posts: postsMocks.medium,
      resource: PostResources.MEDIUM,
    });

    const posts = await postModel.getPosts();

    expect(prepareDbPosts(posts)).toEqual(
      prepareMockMediumPosts(postsMocks.medium),
    );
    done();
  });

  it('postDelivery should insert DEVTO posts', async done => {
    const mockPosts = postsMocks.devto;
    await postModel.savePosts({
      posts: mockPosts,
      resource: PostResources.DEVTO,
    });

    const dbPosts = await postModel.getPosts();

    expect(prepareDbPosts(dbPosts)).toEqual(prepareMockDevtoPosts(mockPosts));

    done();
  });

  it('postDelivery should insert and update HABR posts', async done => {
    await postModel.savePosts({
      posts: postsMocks.habr,
      resource: PostResources.HABR,
    });

    const posts = await postModel.getPosts();

    expect(prepareDbPosts(posts)).toEqual(
      prepareMockHabrPosts(postsMocks.habr),
    );

    await postModel.savePosts({
      posts: postsMocks.habr.map(post => ({
        ...post,
        totalVotes: post.totalVotes + 1,
      })),
      resource: PostResources.HABR,
    });

    const postsUpdated = await postModel.getPosts();

    expect(prepareDbPosts(postsUpdated)).toEqual(
      prepareMockHabrPosts(
        postsMocks.habr.map(post => ({
          ...post,
          rating: post.rating + 1,
        })),
      ),
    );

    done();
  });
});
