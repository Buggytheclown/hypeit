import { Test, TestingModule } from '@nestjs/testing';
import { DevbyEventsModule } from './devbyEvents.module';
import { DevbyEventsHttpService } from './devbyEventsHttp.service';
import { DevbyEventsGrabberService } from './devbyEventsGrabber.service';
import { devbyEventsParsed } from './__mocks__/devbyEventsParsed.mock';
import { devbyEventsMock } from './__mocks__/devbyEvents.mock';

const devbyHttpServiceMock: DevbyEventsHttpService = {
  getEvents() {
    return Promise.resolve([devbyEventsMock]);
  },
};

describe('devbyEvents', () => {
  let grabber: DevbyEventsGrabberService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DevbyEventsModule],
    })
      .overrideProvider(DevbyEventsHttpService)
      .useValue(devbyHttpServiceMock)
      .compile();

    grabber = app.get<DevbyEventsGrabberService>(DevbyEventsGrabberService);
  });

  it('WHEN mock loaded THEN should validate it right', async () => {
    const parsed = await grabber.getEvents(123);
    expect(parsed).toEqual(devbyEventsParsed);
  });
});
