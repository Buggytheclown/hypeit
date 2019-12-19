import { Test, TestingModule } from '@nestjs/testing';
import { habrData1 } from './habrData1.mock';
import { habrMockParsed } from './habrData1Parsed.mock';
import { HabrGrabberModule } from './habrGrabber.module';
import { HabrHttpService } from './habrHttp.service';
import { HabrPostGrabberService } from './habrPostGrabber.service';

const habrHttpServiceMock = {
  getBestOfTheWeek() {
    return Promise.resolve([habrData1]);
  },
};

describe('habrPostGrabber', () => {
  let habrPostGrabberService: HabrPostGrabberService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HabrGrabberModule],
    })
      .overrideProvider(HabrHttpService)
      .useValue(habrHttpServiceMock)
      .compile();

    habrPostGrabberService = app.get<HabrPostGrabberService>(
      HabrPostGrabberService,
    );
  });

  it('WHEN mock loaded THEN should validate it right', async () => {
    const parsed = await habrPostGrabberService.getBestOfTheWeek();
    expect(parsed.posts).toEqual(habrMockParsed);
  });
});
