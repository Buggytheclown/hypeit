import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { EventModelService } from './eventModel.service';
import { eventsMock } from './__mocks__/events.mock';
import { UserModelService } from './userModel.service';
import * as _ from 'lodash';
import { assert } from '../helpers/helpers';

describe('eventModel', () => {
  let eventModel: EventModelService;
  let userService: UserModelService;
  let user;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    eventModel = app.get<EventModelService>(EventModelService);

    userService = app.get<UserModelService>(UserModelService);

    try {
      await userService.saveUser({ name: 'admin', password: 'admin' });
    } catch (e) {}

    user = await userService.getVerifiedUser({
      name: 'admin',
      password: 'admin',
    });
  });

  afterEach(async () => {
    return Promise.all([
      eventModel.deleteAllEvents(),
      eventModel.deleteAllSeenEvents({ userId: user.user_id }),
    ]);
  });

  it('eventModel should insert events twice', async () => {
    await eventModel.saveEvents(eventsMock);
    await eventModel.saveEvents(eventsMock);

    const events = await eventModel.getEvents();

    expect(
      _.sortBy(events, ['link']).map(el => _.omit(el, 'event_id')),
    ).toEqual(_.sortBy(eventsMock, ['link']));
  });

  it('eventModel should return notSeenEvents', async () => {
    await eventModel.saveEvents(eventsMock);
    const events = await eventModel.getEvents();

    assert(events[0]);

    await eventModel.saveSeenEvents({
      eventsId: [events[0].event_id],
      userId: user.user_id,
    });

    const notSeenEvents = await eventModel.getEvents({
      userId: user.user_id,
      onlyNotSeen: true,
    });

    expect(notSeenEvents.map(el => el.link)).toEqual(
      events.slice(1).map(el => el.link),
    );
  });
});
