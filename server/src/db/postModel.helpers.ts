import {
  DevtoPostRatingInfo,
  HabrPostRatingInfo,
  MediumPostRatingInfo,
  PostData,
  PostResources,
} from '../services/postDelivery/post.interfaces';
import { exhaustiveCheck } from '../helpers/helpers';
import { DBConnection } from './dBConnection.service';
import * as yup from 'yup';
import { CustomLoggerService } from '../services/logger/customLogger.service';
import * as _ from 'lodash';
import { PostResourcesData } from '../services/postDelivery/postResourses.interfaces';

export const dbPostsSchema = yup.array(
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
export const dbResoursesSchema = yup.array(
  yup.object({
    resources_id: yup.number(),
    name: yup.string(),
    link: yup.string(),
    favicon: yup.string(),
  }),
);
export const dbPostLinkSchema = yup.object({
  link: yup.string().required(),
});
type DbResourses = yup.InferType<typeof dbResoursesSchema>;
export type PostWithRating = PostResourcesData['posts'] extends Array<
  infer Post
>
  ? Post & { rating: number }
  : never;

export function getRatingInfo(
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

export async function insertPosts({
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

export async function insertTags({
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

export function findInsertedPosts({
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

export function findInsertedTags({
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

export function createPostsTagsRelations({
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
    return tags
      //  temporal workaround when some tags are not inserted ("médium" problem)
      .filter(tagName => insertedTagsByTagsName[tagName])
      .map(tagName => ({
        posts_id,
        tags_id: insertedTagsByTagsName[tagName].tags_id,
      }));
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

export function withPostRating({ posts, resource }) {
  const calculator = getRatingCalculator(resource);
  return posts.map(post => ({ ...post, rating: calculator(post) }));
}

export function assertAllPostWasFound({
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

export function assertAllTagsWasFound({
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
    // throw new Error(`${difference.length} tags name was not found`);
  }
}

export const extractTags = _.flow([
  arr => arr.map(({ tags }) => tags),
  _.flatten,
  _.uniq,
]);

const dbTouchedPostSchema = yup
  .object({
    date: yup.string().required(),
    count: yup.number().required(),
    resources_id: yup.number().required(),
  })
  .noUnknown();

export const dbTouchedPostsSchema = yup.array(dbTouchedPostSchema);
export type DbTouchedPost = yup.InferType<typeof dbTouchedPostSchema>;

export function getTouchecPostFactory({ knex, table }) {
  return function({
    userId,
    date_from,
    date_to,
  }: {
    userId: number;
    date_from: string;
    date_to: string;
  }) {
    return knex(table)
      .select(knex.raw('cast(datetime as Date) as date'), 'resources_id')
      .count('* as count')
      .whereBetween('datetime', [date_from, date_to])
      .where({ user_id: userId })
      .innerJoin('posts', `${table}.posts_id`, 'posts.posts_id')
      .groupBy('date', 'resources_id')
      .then(row => dbTouchedPostsSchema.validateSync(row, { strict: true }));
  };
}
