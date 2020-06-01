import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import * as _ from 'lodash';
import * as yup from 'yup';
import { PostResourcesData } from '../services/postDelivery/postResourses.interfaces';
import { CustomLoggerService } from '../services/logger/customLogger.service';
import {
  assertAllPostWasFound,
  assertAllTagsWasFound,
  createPostsTagsRelations,
  dbPostLinkSchema,
  DbPosts,
  dbPostsSchema,
  dbResoursesSchema,
  extractTags,
  findInsertedPosts,
  findInsertedTags,
  insertPosts,
  insertTags,
  withPostRating,
} from './postModel.helpers';
import { exhaustiveCheck } from '../helpers/helpers';

enum SEEN_POST_STATE {
  SEEN = 'SEEN',
  NOT_SEEN = 'NOT_SEEN',
  ALL = 'ALL',
}

@Injectable()
export class PostModel {
  constructor(
    private readonly dBConnection: DBConnection,
    private readonly cls: CustomLoggerService,
  ) {}

  private getPostsModel({
    lastXDays,
    userId,
    seen = SEEN_POST_STATE.ALL,
    onlyBookmarked = false,
    tagName,
  }: {
    limit?: number;
    lastXDays?: number;
    offset?: number;
    userId?: number;
    onlyBookmarked?: boolean;
    seen?: SEEN_POST_STATE;
    tagName?: string;
  } = {}) {
    if (
      (onlyBookmarked ||
        seen === SEEN_POST_STATE.NOT_SEEN ||
        seen === SEEN_POST_STATE.SEEN) &&
      !userId
    ) {
      throw new TypeError(
        `Configuration error, userId is required if (onlyBookmarked || SEEN_POST_STATE.NOT_SEEN)`,
      );
    }

    return this.dBConnection
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
      .where(builder =>
        lastXDays
          ? builder.whereRaw(
              'time BETWEEN CURDATE() - INTERVAL ? DAY AND CURDATE() + INTERVAL 1 DAY',
              [lastXDays],
            )
          : builder,
      )
      .where(builder => {
        if (!userId || seen === SEEN_POST_STATE.ALL) {
          return builder;
        }
        const params = [
          'posts.posts_id',
          this.dBConnection
            .knex('seen_users_posts')
            .select('posts_id')
            .where({ user_id: userId }),
        ] as const;

        if (seen === SEEN_POST_STATE.NOT_SEEN) {
          return builder.whereNotIn(...params);
        }
        if (seen === SEEN_POST_STATE.SEEN) {
          return builder.whereIn(...params);
        }
        exhaustiveCheck(seen);
      })
      .where(builder =>
        onlyBookmarked
          ? builder.whereNotNull(`bp.bookmarked_users_posts`)
          : builder,
      )
      .groupBy('posts.posts_id')
      .modify(builder =>
        tagName
          ? builder
              .select(this.dBConnection.knex.raw('JSON_ARRAYAGG(name) as tags'))
              .havingRaw(`(? MEMBER OF (tags))`, [tagName])
          : builder,
      );
  }

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

  async countPosts({
    lastXDays,
    tagName,
  }: {
    lastXDays?: number;
    tagName?: string;
  }): Promise<number> {
    return this.dBConnection
      .knex(
        this.getPostsModel({
          lastXDays,
          tagName,
          seen: SEEN_POST_STATE.ALL,
        })
          .select('posts.posts_id')
          .as('allPosts'),
      )
      .count('*', { as: 'count' })
      .then(([{ count }]) => count)
      .then(res => yup.number().validateSync(res));
  }

  async countSeenPosts({
    lastXDays,
    userId,
    tagName,
  }: {
    lastXDays?: number;
    userId: number;
    tagName?: string;
  }): Promise<number> {
    return this.dBConnection
      .knex(
        this.getPostsModel({
          userId,
          lastXDays,
          tagName,
          seen: SEEN_POST_STATE.SEEN,
        })
          .select('posts.posts_id')
          .as('allPosts'),
      )
      .count('*', { as: 'count' })
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
    const knexQuery = this.getPostsModel({
      lastXDays,
      userId,
      seen: onlyNotSeen ? SEEN_POST_STATE.NOT_SEEN : SEEN_POST_STATE.ALL,
      onlyBookmarked,
      tagName,
    })
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
