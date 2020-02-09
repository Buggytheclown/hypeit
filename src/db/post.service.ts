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
import { esc } from './helpers';
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

const dbResoursesSchema = yup.array(
  yup.object({
    resources_id: yup.number(),
    name: yup.string(),
    link: yup.string(),
    favicon: yup.string(),
  }),
);

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
    .query(
      `SELECT resources_id
         FROM resources WHERE name = ${esc(resource)}`,
    )
    .then(({ results: [firstResult] }) => (firstResult || {}).resources_id);

  if (!resourcesId) {
    throw new TypeError(`Cannot find resource_id for resource: ${resource}`);
  }

  const values = posts
    .map(post => {
      const {
        title,
        time,
        rawTime,
        link,
        rating,
        externalID,
        imageLink,
      } = post;

      const {
        totalViews,
        totalVotes,
        voterCount,
        clapCount,
        score,
      } = getRatingInfo(post, resource);

      return `(${[
        esc(title),
        esc(time),
        esc(rawTime),
        esc(link),
        rating,
        resourcesId,
        esc(externalID),
        esc(imageLink),
        toNullable(totalViews),
        toNullable(totalVotes),
        toNullable(clapCount),
        toNullable(voterCount),
        toNullable(score),
      ].join(',')})`;
    })
    .join(',');

  const insertPostsQuery = `
      INSERT INTO posts(
        title, time, rawTime, link,
        rating, resources_id, external_posts_id, image_link,
        total_views, total_votes, clap_count, voter_count,
        score)
      VALUES ${values} ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        total_views = VALUES(total_views),
        total_votes = VALUES(total_votes),
        clap_count = VALUES(clap_count),
        voter_count = VALUES(voter_count),
        score = VALUES(score);
    `;
  return dBConnection.query(insertPostsQuery);
}

async function insertTags({
  extractedTags,
  dBConnection,
}: {
  extractedTags: string[];
  dBConnection: DBConnection;
}) {
  const insertTagsQuery = `
      INSERT IGNORE INTO tags(name)
      VALUES ${extractedTags.map(el => `(${esc(el)})`).join(',')};
    `;

  return dBConnection.query(insertTagsQuery);
}

function findInsertedPosts({
  posts,
  resource,
  dBConnection,
}: {
  posts: PostData[];
  resource: PostResources;
  dBConnection: DBConnection;
}): Promise<
  Array<{
    posts_id: number;
    external_posts_id: string;
  }>
> {
  const query = `
    SELECT posts_id, external_posts_id FROM posts
    WHERE external_posts_id IN (${posts
      .map(({ externalID }) => esc(externalID))
      .join(',')})`;

  return dBConnection.query(query).then(({ results }) => results);
}

function findInsertedTags({
  extractedTags,
  resource,
  dBConnection,
}: {
  extractedTags: string[];
  resource: PostResources;
  dBConnection: DBConnection;
}): Promise<
  Array<{
    tags_id: number;
    name: string;
  }>
> {
  const query = `
    SELECT tags_id, name FROM tags
    WHERE name IN (${extractedTags.map(el => esc(el)).join(',')})
  `;
  return dBConnection.query(query).then(({ results }) => {
    return results;
  });
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
        throw new Error(
          `NONONo tagName: ${tagName}, externalID: ${externalID}`,
        );
      }
      return [posts_id, insertedTagsByTagsName[tagName].tags_id];
    });
  });

  const query = `
    INSERT IGNORE INTO posts_tags(posts_id, tags_id) VALUES ${postIdsTagsIds
      .map(postIdsTagsId => `(${postIdsTagsId.join(',')})`)
      .join(',')}
  `;
  return dBConnection.query(query);
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
    const query = `
      SELECT COUNT(*) as count FROM posts
      ${
        lastXDays
          ? `WHERE time BETWEEN CURDATE() - INTERVAL ${lastXDays} DAY AND CURDATE() + INTERVAL 1 DAY`
          : ''
      };`;

    return this.dBConnection
      .query(query)
      .then(({ results: [{ count }] }) => count)
      .then(res => yup.number().validateSync(res));
  }

  async countSeenPosts({
    lastXDays,
    userId,
  }: {
    lastXDays?: number;
    userId: number;
  }): Promise<number> {
    const whereClause = [
      lastXDays &&
        `time BETWEEN CURDATE() - INTERVAL ${lastXDays} DAY AND CURDATE() + INTERVAL 1 DAY`,
      userId &&
        `posts.posts_id IN (SELECT posts_id FROM seen_users_posts WHERE user_id = ${userId})`,
    ]
      .filter(Boolean)
      .join(' AND ');
    const query = `
      SELECT COUNT(*) as count FROM posts
    ${whereClause ? `WHERE ${whereClause}` : ''}`;

    return this.dBConnection
      .query(query)
      .then(({ results: [{ count }] }) => count)
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
  } = {}): Promise<Required<yup.InferType<typeof dbPostsSchema>>> {
    const whereClause = [
      lastXDays &&
        `time BETWEEN CURDATE() - INTERVAL ${esc(lastXDays)} DAY AND CURDATE() + INTERVAL 1 DAY`,
      onlyNotSeen &&
        userId &&
        `posts.posts_id NOT IN (SELECT posts_id FROM seen_users_posts WHERE user_id = ${esc(userId)})`,
      onlyBookmarked && `bp.bookmarked_users_posts IS NOT NULL`,
    ]
      .filter(Boolean)
      .join(' AND ');
    const query = `
      SELECT posts.posts_id, title, time,
             rawTime, link, rating, resources_id,
             image_link as imageLink, external_posts_id as externalID,
             JSON_ARRAYAGG(name) as tags, MAX(bp.bookmarked_users_posts IS NOT NULL) as bookmarked
        FROM posts
                  JOIN posts_tags on posts.posts_id = posts_tags.posts_id
                  JOIN tags on posts_tags.tags_id = tags.tags_id
                  LEFT JOIN (SELECT bookmarked_users_posts, posts_id FROM bookmarked_users_posts WHERE ${
                    userId ? `user_id = ${esc(userId)}` : 'FALSE'
                  }) as bp on posts.posts_id = bp.posts_id
        ${whereClause ? `WHERE ${whereClause}` : ''}
        GROUP BY posts.posts_id
        ${tagName ? `HAVING (${esc(tagName)} MEMBER OF (tags))` : ''}
        ORDER BY rating DESC
        LIMIT ${offset}, ${limit}
`;
    return this.dBConnection
      .query(query)
      .then(({ results }) =>
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
    return this.dBConnection.query(query);
  }

  async getResourcesMap(): Promise<{ [resources_id: string]: string }> {
    const query = `SELECT *
                   FROM resources;`;
    return this.dBConnection
      .query(query)
      .then(({ results }) => results)
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
    const query = `
    INSERT IGNORE INTO seen_users_posts(posts_id, user_id) VALUES ${postsId
      .map(postId => `(${postId}, ${userId})`)
      .join(',')}
  `;
    return this.dBConnection.query(query);
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
      const query = `INSERT IGNORE INTO bookmarked_users_posts(posts_id, user_id) VALUE (${postId}, ${userId})`;
      return this.dBConnection.query(query);
    }
    const query = `DELETE FROM bookmarked_users_posts WHERE posts_id=${postId} AND user_id=${userId};`;
    return this.dBConnection.query(query);
  }
}
