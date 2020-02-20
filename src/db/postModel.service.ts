import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import {
  DevtoPostRatingInfo,
  HabrPostRatingInfo,
  MediumPostRatingInfo,
  PostData,
  PostResources,
} from '../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import * as yup from 'yup';
import { PostResourcesData } from '../services/postDelivery/postResourses.interfaces';
import { exhaustiveCheck } from '../helpers/helpers';
import { CustomLoggerService } from '../services/logger/customLogger.service';

const dbPostsSchema = yup.array(
  yup.object({
    posts_id: yup.number(),
    title: yup.string(),
    time: yup.string(),
    rawTime: yup.string(),
    link: yup.string(),
    imageLink: yup.string().nullable(),
    externalID: yup.string(),
    rating: yup.number(),
    resources_id: yup.number(),
    tags: yup.array(yup.string()),
    bookmarked: yup.boolean(),
  }),
);

export type DbPosts = yup.InferType<typeof dbPostsSchema>;

const dbResoursesSchema = yup.array(
  yup.object({
    resources_id: yup.number(),
    name: yup.string(),
    link: yup.string(),
    favicon: yup.string(),
  }),
);

const dbPostLinkSchema = yup.object({
  link: yup.string().required(),
});

type DbResourses = yup.InferType<typeof dbResoursesSchema>;

type PostWithRating = PostResourcesData['posts'] extends Array<infer Post>
  ? Post & { rating: number }
  : never;

function getRatingInfo(
  post,
  resource: PostResources,
): {
  totalViews: number | null;
  totalVotes: number | null;
  voterCount: number | null;
  clapCount: number | null;
  score: number | null;
} {
  const nullRatingInfo = {
    totalViews: null,
    totalVotes: null,
    voterCount: null,
    clapCount: null,
    score: null,
  };
  if (resource === PostResources.HABR) {
    return {
      ...nullRatingInfo,
      totalViews: post.totalViews,
      totalVotes: post.totalVotes,
    };
  }

  if (resource === PostResources.MEDIUM) {
    return {
      ...nullRatingInfo,
      voterCount: post.voterCount,
      clapCount: post.clapCount,
    };
  }

  if (resource === PostResources.DEVTO) {
    return {
      ...nullRatingInfo,
      score: post.score,
    };
  }

  exhaustiveCheck(resource);
}

function toNullable<T>(value: T): T | 'NULL' {
  if (value === null) {
    return 'NULL';
  }
  return value;
}

async function insertPosts({
  posts,
  resource,
  dBConnection,
}: {
  posts: PostWithRating[];
  resource: PostResources;
  dBConnection: DBConnection;
}) {
  const resourcesId = await dBConnection
    .knex('resources')
    .select('resources_id')
    .where({ name: resource })
    .then(([firstResult]) => (firstResult || {}).resources_id);

  if (!resourcesId) {
    throw new TypeError(`Cannot find resource_id for resource: ${resource}`);
  }

  const values = posts.map(post => {
    const { title, time, rawTime, link, rating, externalID, imageLink } = post;

    const {
      totalViews,
      totalVotes,
      voterCount,
      clapCount,
      score,
    } = getRatingInfo(post, resource);

    return {
      title,
      time,
      rawTime,
      link,
      rating,
      resources_id: resourcesId,
      external_posts_id: externalID,
      image_link: imageLink,
      total_views: totalViews,
      total_votes: totalVotes,
      clap_count: clapCount,
      voter_count: voterCount,
      score,
    };
  });

  return dBConnection.knexUpsert(dBConnection.knex('posts').insert(values), [
    'rating',
    'total_views',
    'total_votes',
    'clap_count',
    'voter_count',
    'score',
  ]);
}

async function insertTags({
  extractedTags,
  dBConnection,
}: {
  extractedTags: string[];
  dBConnection: DBConnection;
}) {
  const knexQuery = dBConnection
    .knex('tags')
    .insert(extractedTags.map(name => ({ name })));
  return dBConnection.knexInsertIgnore(knexQuery);
}

const insertedPostsSchema = yup.array(
  yup.object({
    posts_id: yup.number().required(),
    external_posts_id: yup.string().required(),
  }),
);

function findInsertedPosts({
  posts,
  resource,
  dBConnection,
}: {
  posts: PostData[];
  resource: PostResources;
  dBConnection: DBConnection;
}) {
  return dBConnection
    .knex('posts')
    .select('posts_id', 'external_posts_id')
    .whereIn(
      'external_posts_id',
      posts.map(({ externalID }) => externalID),
    )
    .then(data => insertedPostsSchema.validateSync(data));
}

const insertedTagsSchema = yup.array(
  yup.object({
    tags_id: yup.number().required(),
    name: yup.string().required(),
  }),
);

function findInsertedTags({
  extractedTags,
  resource,
  dBConnection,
}: {
  extractedTags: string[];
  resource: PostResources;
  dBConnection: DBConnection;
}) {
  return dBConnection
    .knex('tags')
    .select('tags_id', 'name')
    .whereIn('name', extractedTags)
    .then(data => insertedTagsSchema.validateSync(data));
}

function createPostsTagsRelations({
  posts,
  insertedPosts,
  insertedTags,
  dBConnection,
  cls,
}: {
  posts: PostData[];
  insertedPosts: Array<{ posts_id: number; external_posts_id: string }>;
  insertedTags: Array<{ tags_id: number; name: string }>;
  dBConnection: DBConnection;
  cls: CustomLoggerService;
}) {
  const insertedPostsByExternalPostId = _.keyBy(
    insertedPosts,
    ({ external_posts_id }) => external_posts_id,
  );

  const insertedTagsByTagsName = _.keyBy(insertedTags, ({ name }) => name);

  const postIdsTagsIds = _.flatMap(posts, ({ externalID, tags }) => {
    const posts_id = insertedPostsByExternalPostId[externalID].posts_id;
    return tags.map(tagName => {
      if (!insertedTagsByTagsName[tagName]) {
        cls.error(
          `!insertedTagsByTagsName[tagName]: ${JSON.stringify({
            tagName,
            externalID,
            tags,
          })}`,
        );
        throw new Error(`No tagName: ${tagName}, externalID: ${externalID}`);
      }
      return { posts_id, tags_id: insertedTagsByTagsName[tagName].tags_id };
    });
  });

  const knexQuery = dBConnection.knex('posts_tags').insert(postIdsTagsIds);

  return dBConnection.knexInsertIgnore(knexQuery);
}

function getRatingCalculator(resource: PostResources) {
  switch (resource) {
    case PostResources.HABR:
      return ({ totalVotes, totalViews }: HabrPostRatingInfo) => totalVotes;
    case PostResources.MEDIUM:
      return ({ clapCount, voterCount }: MediumPostRatingInfo) => voterCount;
    case PostResources.DEVTO:
      // 5 times is an average defference between poststs from devto and habr/medium
      return ({ score }: DevtoPostRatingInfo) => score / 5;
    default:
      exhaustiveCheck(resource);
  }
}

function withPostRating({ posts, resource }) {
  const calculator = getRatingCalculator(resource);
  return posts.map(post => ({ ...post, rating: calculator(post) }));
}

function assertAllPostWasFound({
  posts,
  insertedPosts,
  cls,
}: {
  posts: Array<{ externalID: string }>;
  insertedPosts: Array<{ external_posts_id: string }>;
  cls: CustomLoggerService;
}) {
  const insertedPostsByExternalPostId = _.keyBy(
    insertedPosts,
    ({ external_posts_id }) => external_posts_id,
  );

  const notFoundPosts = posts.filter(
    post => !(post.externalID in insertedPostsByExternalPostId),
  );
  if (notFoundPosts.length) {
    cls.error(`notFoundPosts: ${notFoundPosts}`);
    throw new Error(`${notFoundPosts.length} posts id was not found`);
  }
}

function assertAllTagsWasFound({
  extractedTags,
  insertedTags,
  cls,
}: {
  extractedTags: string[];
  insertedTags: Array<{ name: string }>;
  cls: CustomLoggerService;
}) {
  const difference = _.difference(
    extractedTags,
    insertedTags.map(tag => tag.name),
  );
  if (difference.length) {
    cls.error(`assertAllTagsWasFoundDifference: ${difference}`);
    throw new Error(`${difference.length} tags name was not found`);
  }
}

const extractTags = _.flow([
  arr => arr.map(({ tags }) => tags),
  _.flatten,
  _.uniq,
]);

@Injectable()
export class PostModel {
  constructor(
    private readonly dBConnection: DBConnection,
    private readonly cls: CustomLoggerService,
  ) {}

  savePosts = async ({
    posts,
    resource,
  }: PostResourcesData): Promise<{ savedCount: number }> => {
    this.cls.log(
      `savePosts resource: ${resource}, posts.length: ${posts.length}`,
    );
    if (!posts.length) {
      return { savedCount: posts.length };
    }
    await insertPosts({
      posts: withPostRating({ posts, resource }),
      resource,
      dBConnection: this.dBConnection,
    });

    const insertedPosts = await findInsertedPosts({
      posts,
      resource,
      dBConnection: this.dBConnection,
    });

    assertAllPostWasFound({ posts, insertedPosts, cls: this.cls });

    const extractedTags: string[] = extractTags(posts);

    await insertTags({
      extractedTags,
      dBConnection: this.dBConnection,
    });

    const insertedTags = await findInsertedTags({
      extractedTags,
      resource,
      dBConnection: this.dBConnection,
    });

    assertAllTagsWasFound({ extractedTags, insertedTags, cls: this.cls });

    await createPostsTagsRelations({
      posts,
      insertedPosts,
      insertedTags,
      dBConnection: this.dBConnection,
      cls: this.cls,
    });

    return { savedCount: posts.length };
  };

  async countPosts({ lastXDays }: { lastXDays?: number }): Promise<number> {
    return this.dBConnection
      .knex('posts')
      .count('*', { as: 'count' })
      .where(builder =>
        lastXDays
          ? builder.whereRaw(
              'time BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE() + INTERVAL 1 DAY',
              [lastXDays],
            )
          : builder,
      )
      .then(([{ count }]) => count)
      .then(res => yup.number().validateSync(res));
  }

  async countSeenPosts({
    lastXDays,
    userId,
  }: {
    lastXDays?: number;
    userId: number;
  }): Promise<number> {
    return this.dBConnection
      .knex('posts')
      .count('*', { as: 'count' })
      .where(builder =>
        lastXDays
          ? builder.whereRaw(
              'time BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE() + INTERVAL 1 DAY',
              [lastXDays],
            )
          : builder,
      )
      .whereIn(
        'posts.posts_id',
        this.dBConnection
          .knex('seen_users_posts')
          .select('posts_id')
          .where({ user_id: userId }),
      )
      .then(([{ count }]) => count)
      .then(res => yup.number().validateSync(res));
  }

  async getPosts({
    limit = 100,
    lastXDays,
    offset = 0,
    userId,
    onlyNotSeen = false,
    onlyBookmarked = false,
    tagName,
  }: {
    limit?: number;
    lastXDays?: number;
    offset?: number;
    userId?: number;
    onlyBookmarked?: boolean;
    onlyNotSeen?: boolean;
    tagName?: string;
  } = {}): Promise<Required<DbPosts>> {
    if ((onlyBookmarked || onlyNotSeen) && !userId) {
      throw new TypeError(
        `Configuration error, userId is required if (onlyBookmarked || onlyNotSeen)`,
      );
    }

    const knexQuery = this.dBConnection
      .knex('posts')
      .join('posts_tags', 'posts.posts_id', 'posts_tags.posts_id')
      .join('tags', 'posts_tags.tags_id', 'tags.tags_id')
      .leftJoin(
        this.dBConnection
          .knex('bookmarked_users_posts')
          .select('bookmarked_users_posts', 'posts_id')
          .where(builder =>
            userId
              ? builder.where({ user_id: userId })
              : builder.whereRaw('FALSE'),
          )
          .as('bp'),
        'posts.posts_id',
        'bp.posts_id',
      )
      .select(
        'posts.posts_id',
        'title',
        'time',
        'rawTime',
        'link',
        'rating',
        'resources_id',
        'image_link as imageLink',
        'external_posts_id as externalID',
        this.dBConnection.knex.raw('JSON_ARRAYAGG(name) as tags'),
        this.dBConnection.knex.raw(
          'MAX(bp.bookmarked_users_posts IS NOT NULL) as bookmarked',
        ),
      )
      .where(builder =>
        lastXDays
          ? builder.whereRaw(
              'time BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE() + INTERVAL 1 DAY',
              [lastXDays],
            )
          : builder,
      )
      .where(builder =>
        onlyNotSeen && userId
          ? builder.whereNotIn(
              'posts.posts_id',
              this.dBConnection
                .knex('seen_users_posts')
                .select('posts_id')
                .where({ user_id: userId }),
            )
          : builder,
      )
      .where(builder =>
        onlyBookmarked
          ? builder.whereNotNull(`bp.bookmarked_users_posts`)
          : builder,
      )
      .groupBy('posts.posts_id')
      .modify(builder =>
        tagName
          ? builder.havingRaw(`(? MEMBER OF (tags))`, [tagName])
          : builder,
      )
      .orderBy('rating', 'desc')
      .limit(limit)
      .offset(offset);

    return knexQuery
      .then(results =>
        results.map(row => ({ ...row, tags: JSON.parse(row.tags) })),
      )
      .then(res => dbPostsSchema.validateSync(res));
  }

  async deleteAllPosts() {
    const query = `
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE posts;
    TRUNCATE TABLE tags;
    TRUNCATE TABLE posts_tags;
    SET FOREIGN_KEY_CHECKS = 1;`;
    return this.dBConnection.knex.raw(query).then(_.identity);
  }

  async getResourcesMap(): Promise<{ [resources_id: string]: string }> {
    return this.dBConnection
      .knex('resources')
      .select('*')
      .then(res => dbResoursesSchema.validateSync(res))
      .then(res =>
        res.reduce(
          (acc, { resources_id, favicon }) => ({
            ...acc,
            [resources_id]: favicon,
          }),
          {},
        ),
      );
  }

  saveSeenPosts({ postsId, userId }: { postsId: number[]; userId: number }) {
    if (!postsId.length) {
      return;
    }

    const knexQuery = this.dBConnection
      .knex('seen_users_posts')
      .insert(postsId.map(postId => ({ posts_id: postId, user_id: userId })));

    return this.dBConnection.knexInsertIgnore(knexQuery).then(_.identity);
  }

  deleteAllSeenPosts({ userId }: { userId: number }) {
    return this.dBConnection
      .knex('seen_users_posts')
      .where({ user_id: userId })
      .del()
      .then(_.identity);
  }

  toggleBookmarked({
    postId,
    userId,
    bookmark,
  }: {
    postId: number;
    userId: number;
    bookmark: boolean;
  }) {
    if (bookmark) {
      const knexQuery = this.dBConnection
        .knex('bookmarked_users_posts')
        .insert({ posts_id: postId, user_id: userId });

      return this.dBConnection.knexInsertIgnore(knexQuery);
    }

    return this.dBConnection
      .knex('bookmarked_users_posts')
      .where({ posts_id: postId, user_id: userId })
      .del()
      .then(_.identity);
  }

  clearAllBookmarked({ userId }: { userId: number }) {
    return this.dBConnection
      .knex('bookmarked_users_posts')
      .where({ user_id: userId })
      .del()
      .then(_.identity);
  }

  saveOpenedPost({ userId, postId }: { userId: number; postId: number }) {
    const knexQuery = this.dBConnection
      .knex('opened_users_posts')
      .insert({ posts_id: postId, user_id: userId });

    return this.dBConnection.knexInsertIgnore(knexQuery).then(_.identity);
  }

  getPostLink({ postId }: { postId: number }): Promise<string> {
    return (this.dBConnection.knex as any)('posts')
      .select('link')
      .where({ posts_id: postId })
      .then(([row]) => row)
      .then(row => dbPostLinkSchema.validateSync(row))
      .then(row => row.link);
  }
}
