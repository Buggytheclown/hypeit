import { Test, TestingModule } from '@nestjs/testing';
import { PostModel } from './postModel.service';
import { postsMocks } from './__mocks__/posts.mock';
import { PostResources } from '../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import { AppModule } from '../app.module';
import { UserModelService } from './userModel.service';
import { assert } from '../helpers/helpers';

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

describe('post model: save', () => {
  let postModel: PostModel;

  beforeAll(async () => {
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

describe('post model: get', () => {
  let postModel: PostModel;
  let userService: UserModelService;
  let user;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    postModel = app.get<PostModel>(PostModel);

    await postModel.savePosts({
      posts: postsMocks.habr,
      resource: PostResources.HABR,
    });

    await postModel.savePosts({
      posts: postsMocks.devto,
      resource: PostResources.DEVTO,
    });

    await postModel.savePosts({
      posts: postsMocks.medium,
      resource: PostResources.MEDIUM,
    });

    userService = app.get<UserModelService>(UserModelService);

    try {
      await userService.saveUser({ name: 'admin', password: 'admin' });
    } catch (e) {}

    user = await userService.getVerifiedUser({
      name: 'admin',
      password: 'admin',
    });
  });

  afterAll(async () =>
    Promise.all([
      postModel.deleteAllPosts(),
      postModel.clearAllBookmarked({ userId: user.user_id }),
      postModel.deleteAllSeenPosts({ userId: user.user_id }),
    ]),
  );

  const postsExternalIds = [
    '228410',
    '227370',
    'bcd4dfa23541',
    `externalID escape me's!%-<>.,\\`,
    '478282',
    'a5acb485a445',
  ];

  it('should count inserted posts', async () => {
    const count = await postModel.countPosts({});
    expect(count).toEqual(postsExternalIds.length);
  });

  it('should limit/offset', async () => {
    const posts2off2 = await postModel.getPosts({ offset: 2, limit: 2 });
    expect(posts2off2.map(el => el.externalID)).toEqual(
      postsExternalIds.slice(2, 4),
    );
  });

  it('should use userId', async () => {
    const posts = await postModel.getPosts({ userId: user.user_id });
    expect(posts.map(el => el.externalID)).toEqual(postsExternalIds);
  });

  it('should use onlyBookmarked', async () => {
    const posts1 = await postModel.getPosts({
      userId: user.user_id,
      onlyBookmarked: true,
    });
    expect(posts1).toEqual([]);

    const allPosts = await postModel.getPosts();

    const secondPostId = allPosts.find(
      el => el.externalID === postsExternalIds[1],
    )?.posts_id;

    assert(secondPostId);

    await postModel.toggleBookmarked({
      postId: secondPostId,
      userId: user.user_id,
      bookmark: false,
    });

    await postModel.toggleBookmarked({
      postId: secondPostId,
      userId: user.user_id,
      bookmark: true,
    });

    await postModel.toggleBookmarked({
      postId: secondPostId,
      userId: user.user_id,
      bookmark: true,
    });

    const thirdPostId = allPosts.find(
      el => el.externalID === postsExternalIds[2],
    )?.posts_id;

    assert(thirdPostId);

    await postModel.toggleBookmarked({
      postId: thirdPostId,
      userId: user.user_id,
      bookmark: true,
    });

    const posts2 = await postModel.getPosts({
      userId: user.user_id,
      onlyBookmarked: true,
    });

    expect(posts2.map(el => el.externalID)).toEqual([
      postsExternalIds[1],
      postsExternalIds[2],
    ]);
  });

  it('should use onlyNotSeen', async () => {
    const posts1 = await postModel.getPosts({
      userId: user.user_id,
      onlyNotSeen: true,
    });
    expect(posts1.map(el => el.externalID)).toEqual(postsExternalIds);

    const allPosts = await postModel.getPosts();

    const count0 = await postModel.countSeenPosts({ userId: user.user_id });
    expect(count0).toEqual(0);

    await postModel.saveSeenPosts({
      userId: user.user_id,
      postsId: allPosts
        .filter(el =>
          [postsExternalIds[0], postsExternalIds[1]].includes(el.externalID),
        )
        .map(el => el.posts_id),
    });

    const count2 = await postModel.countSeenPosts({ userId: user.user_id });
    expect(count2).toEqual(2);

    const posts2 = await postModel.getPosts({
      userId: user.user_id,
      onlyNotSeen: true,
    });

    expect(posts2.map(el => el.externalID)).toEqual(postsExternalIds.slice(2));
  });

  it('should use tagName', async () => {
    const posts1 = await postModel.getPosts({
      userId: user.user_id,
      tagName: 'Machine Learning',
    });
    expect(posts1.map(el => el.externalID)).toEqual([
      postsExternalIds[2],
      postsExternalIds[5],
    ]);
  });

  it('should use getPostLink', async () => {
    const posts = await postModel.getPosts();

    const firstPost = posts[0];
    assert(firstPost);

    const link = await postModel.getPostLink({
      postId: firstPost.posts_id,
    });

    expect(firstPost.link).toEqual(link);
  });
});
