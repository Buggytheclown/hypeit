import { Test, TestingModule } from '@nestjs/testing';
import { habrData1 } from './__mocks__/habrData1.mock';
import { habrMockParsed } from './__mocks__/habrData1Parsed.mock';
import { HabrGrabberModule } from './habrGrabber.module';
import { HabrHttpService } from './habrHttp.service';
import { HabrPostGrabberService } from './habrPostGrabber.service';
import { CustomLoggerModule } from '../../services/logger/customLogger.module';

const habrHttpServiceMock = {
  getBestOfTheWeek() {
    return Promise.resolve([habrData1]);
  },
};

describe('HabrPostGrabber', () => {
  let service: HabrPostGrabberService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CustomLoggerModule.forRoot(), HabrGrabberModule],
    })
      .overrideProvider(HabrHttpService)
      .useValue(habrHttpServiceMock)
      .compile();

    service = app.get<HabrPostGrabberService>(HabrPostGrabberService);
  });

  it('WHEN mock loaded THEN should validate it right', async () => {
    const parsed = await service.getBestOfTheWeek();

    expect(parsed.posts).toEqual(habrMockParsed);
  });
});
