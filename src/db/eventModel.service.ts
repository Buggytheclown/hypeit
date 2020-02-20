import { Injectable } from '@nestjs/common';
import { DBConnection } from './dBConnection.service';
import * as yup from 'yup';
import * as _ from 'lodash';

const dbEventSchema = yup.array(
  yup.object({
    event_id: yup.number().required(),
    title: yup.string().required(),
    link: yup.string().required(),
    time: yup.string().required(),
  }),
);

export type DbEvent = yup.InferType<typeof dbEventSchema>;

@Injectable()
export class EventModelService {
  constructor(private readonly dBConnection: DBConnection) {}

  async saveEvents(
    events: Array<{
      time: string;
      link: string;
      title: string;
    }>,
  ) {
    const knexQuery = this.dBConnection.knex('events').insert(events);

    return this.dBConnection
      .knexUpsert(knexQuery, ['time', 'title'])
      .then(_.identity);
  }

  saveSeenEvents({ eventsId, userId }: { eventsId: number[]; userId: number }) {
    if (!eventsId.length) {
      return;
    }

    const knexQuery = this.dBConnection
      .knex('seen_users_events')
      .insert(
        eventsId.map(eventId => ({ events_id: eventId, user_id: userId })),
      );
    return this.dBConnection.knexInsertIgnore(knexQuery).then(_.identity);
  }

  async getEvents({
    limit = 100,
    featureXDays,
    userId,
    onlyNotSeen = false,
  }: {
    limit?: number;
    featureXDays?: number;
    userId?: number;
    onlyNotSeen?: boolean;
  } = {}): Promise<DbEvent> {
    if (onlyNotSeen && !userId) {
      throw new TypeError(
        `Configuration error, userId is required if (onlyBookmarked)`,
      );
    }

    const knexQuery = this.dBConnection
      .knex('events')
      .select('event_id', 'title', 'link', 'time')
      .where(builder =>
        featureXDays
          ? builder.whereRaw(
              'time BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() + INTERVAL ? DAY',
              [featureXDays],
            )
          : builder,
      )
      .where(builder =>
        onlyNotSeen && userId
          ? builder.whereNotIn(
              'events.event_id',
              this.dBConnection
                .knex('seen_users_events')
                .select('events_id')
                .where({ user_id: userId }),
            )
          : builder,
      )
      .orderBy('time', 'desc')
      .limit(limit);
    return knexQuery.then(res => dbEventSchema.validateSync(res));
  }

  deleteAllEvents() {
    return this.dBConnection
      .knex('events')
      .del()
      .then(_.identity);
  }

  deleteAllSeenEvents({ userId }: { userId: number }) {
    return this.dBConnection
      .knex('seen_users_events')
      .where({ user_id: userId })
      .del()
      .then(_.identity);
  }
}
