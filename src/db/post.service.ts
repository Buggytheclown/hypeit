import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import {
  HabrPostRatingInfo,
  MediumPostRatingInfo,
  PostData,
  PostResources,
} from '../services/postDelivery/post.interfaces';
import * as _ from 'lodash';
import * as yup from 'yup';
import { esc } from './helpers';
import { PostResourcesData } from '../services/postDelivery/postResourses.interfaces';

const dbPostsSchema = yup.array(
  yup.object({
    title: yup.string(),
    time: yup.string(),
    rawTime: yup.string(),
    link: yup.string(),
    imageLink: yup.string().nullable(),
    externalID: yup.string(),
    rating: yup.number(),
    resources_id: yup.number(),
    tags: yup.array(yup.string()),
  }),
);

type PostWithRating = PostResourcesData['posts'] extends Array<infer Post>
  ? Post & { rating: number }
  : never;

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
    .query(`SELECT resources_id FROM resources WHERE name = ${esc(resource)}`)
    .then(({ results: [firstResult] }) => (firstResult || {}).resources_id);

  if (!resourcesId) {
    throw new TypeError(`Cannot find resource_id for resource: ${resource}`);
  }

  const values = posts
    .map(
      ({
        title,
        time,
        rawTime,
        link,
        rating,
        externalID,
        imageLink,
        totalViews,
        totalVotes,
      }) =>
        `(${[
          esc(title),
          esc(time),
          esc(rawTime),
          esc(link),
          rating,
          resourcesId,
          esc(externalID),
          esc(imageLink),
          totalViews,
          totalVotes,
        ].join(',')})`,
    )
    .join(',');

  const insertPostsQuery = `
      INSERT INTO posts(title, time, rawTime, link, rating, resources_id, external_posts_id, image_link, total_views, total_votes)
      VALUES ${values} ON DUPLICATE KEY UPDATE rating = rating, total_views = total_views, total_votes = total_votes;
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
    WHERE name IN (${extractedTags.map(el => `${esc(el)}`).join(',')})
  `;

  return dBConnection.query(query).then(({ results }) => results);
}

function createPostsTagsRelations({
  posts,
  insertedPosts,
  insertedTags,
  dBConnection,
}: {
  posts: PostData[];
  insertedPosts: Array<{ posts_id: number; external_posts_id: string }>;
  insertedTags: Array<{ tags_id: number; name: string }>;
  dBConnection: DBConnection;
}) {
  const insertedPostsByExternalPostId = _.keyBy(
    insertedPosts,
    ({ external_posts_id }) => external_posts_id,
  );

  const insertedTagsByTagsName = _.keyBy(insertedTags, ({ name }) => name);

  const postIdsTagsIds = _.flatMap(posts, ({ externalID, tags }) => {
    const posts_id = insertedPostsByExternalPostId[externalID].posts_id;
    return tags.map(tagName => [
      posts_id,
      insertedTagsByTagsName[tagName].tags_id,
    ]);
  });

  const query = `
    INSERT IGNORE INTO posts_tags(posts_id, tags_id) VALUES ${postIdsTagsIds
      .map(postIdsTagsId => `(${postIdsTagsId.join(',')})`)
      .join(',')}
  `;
  return dBConnection.query(query);
}

const calculators = {
  [PostResources.HABR]: ({ totalVotes, totalViews }: HabrPostRatingInfo) =>
    totalVotes,
  [PostResources.MEDIUM]: ({ clapCount, voterCount }: MediumPostRatingInfo) =>
    clapCount / (voterCount * 5),
};

function withPostRating({ posts, resource }) {
  const calculator = calculators[resource];
  return posts.map(post => ({ ...post, rating: calculator(post) }));
}

@Injectable()
export class PostModel {
  constructor(private readonly dBConnection: DBConnection) {}

  async savePosts({ posts, resource }: PostResourcesData) {
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

    const extractedTags: string[] = _.flow([
      arr => arr.map(({ tags }) => tags),
      _.flatten,
      _.uniq,
    ])(posts);

    await insertTags({
      extractedTags,
      dBConnection: this.dBConnection,
    });

    const insertedTags = await findInsertedTags({
      extractedTags,
      resource,
      dBConnection: this.dBConnection,
    });

    await createPostsTagsRelations({
      posts,
      insertedPosts,
      insertedTags,
      dBConnection: this.dBConnection,
    });
  }

  async getPosts(
    {
      limit,
      lastXDays,
      offset,
    }: { limit: number; lastXDays?: number; offset: number } = {
      limit: 100,
      offset: 0,
    },
  ): Promise<Required<yup.InferType<typeof dbPostsSchema>>> {
    const query = `
      SELECT title, time, rawTime, link, rating, resources_id, image_link as imageLink, external_posts_id as externalID, JSON_ARRAYAGG(name) as tags FROM posts
                JOIN posts_tags on posts.posts_id = posts_tags.posts_id
                JOIN tags on posts_tags.tags_id = tags.tags_id
      ${
        lastXDays
          ? `WHERE time BETWEEN CURDATE() - INTERVAL ${lastXDays} DAY AND CURDATE()`
          : ''
      }
      GROUP BY posts.posts_id
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
}
