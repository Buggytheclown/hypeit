import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import * as jsStringEscape from 'js-string-escape';
import {
  PostData,
  PostResources,
} from '../services/postDelivery/post.interfaces';

@Injectable()
export class PostModel {
  constructor(private readonly dBConnection: DBConnection) {}

  async savePosts({
    posts,
    resource,
  }: {
    posts: PostData[];
    resource: PostResources;
  }) {
    const resourcesId = await this.dBConnection
      .query(`SELECT resources_id FROM resources WHERE name = '${resource}'`)
      .then(({ results: [firstResult] }) => (firstResult || {}).resources_id);

    if (!resourcesId) {
      throw new TypeError(`Cannot find resource_id for resource: ${resource}`);
    }

    const values = posts
      .map(
        ({ title, time, rawTime, link, rating, externalID }) =>
          `('${jsStringEscape(
            title,
          )}', '${time}', '${rawTime}', '${link}', ${rating}, ${resourcesId}, ${externalID})`,
      )
      .join(',');

    const query = `
      INSERT INTO posts(title, time, rawTime, link, rating, resources_id, external_posts_id)
      VALUES ${values};
    `;

    return this.dBConnection.query(query);
  }

  async getPosts() {
    const query = `SELECT title, time, rawTime, link, rating, resources_id FROM posts`;
    return this.dBConnection.query(query);
  }
}
