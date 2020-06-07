import { Test, TestingModule } from '@nestjs/testing';
import { mediumData1Mock } from './__mocks__/mediumData1.mock';
import { mediumData1Parsed } from './__mocks__/mediumData1Parsed.mock';
import { CustomLoggerModule } from '../../services/logger/customLogger.module';
import { MediumPostGrabberService } from './mediumPostGrabber.service';
import { MediumGrabberModule } from './mediumGrabber.module';
import { MediumHttpService } from './mediumHttp.service';

const mediumHttpServiceMock = {
  getBestOfTheWeek() {
    return Promise.resolve([mediumData1Mock]);
  },
};

describe('MediumPostGrabber', () => {
  let service: MediumPostGrabberService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CustomLoggerModule.forRoot(), MediumGrabberModule],
    })
      .overrideProvider(MediumHttpService)
      .useValue(mediumHttpServiceMock)
      .compile();

    service = app.get<MediumPostGrabberService>(MediumPostGrabberService);
  });

  it('WHEN mock loaded THEN should validate it right', async () => {
    const parsed = await service.getBestOfTheWeek();

    expect(parsed.posts).toEqual(mediumData1Parsed);
  });
});
