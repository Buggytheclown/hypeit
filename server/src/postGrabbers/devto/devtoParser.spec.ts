import { Test, TestingModule } from '@nestjs/testing';
import { devtoDataMock } from './__mocks__/devtoData1.mock';
import { CustomLoggerModule } from '../../services/logger/customLogger.module';
import { DevtoPostGrabberService } from './devtoPostGrabber.service';
import { DevtoGrabberModule } from './devtoGrabber.module';
import { DevtoHttpService } from './devtoHttp.service';
import { devtoMockParsed } from './__mocks__/devtoData1Parsed.mock';

const devtoHttpServiceMock = {
  getBestOfTheWeek() {
    return Promise.resolve(devtoDataMock);
  },
};

describe('DevtoPostGrabber', () => {
  let service: DevtoPostGrabberService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CustomLoggerModule.forRoot(), DevtoGrabberModule],
    })
      .overrideProvider(DevtoHttpService)
      .useValue(devtoHttpServiceMock)
      .compile();

    service = app.get<DevtoPostGrabberService>(DevtoPostGrabberService);
  });

  it('WHEN mock loaded THEN should parse it right', async () => {
    const parsed = await service.getBestOfTheWeek();

    expect(parsed.posts).toEqual(devtoMockParsed);
  });
});
