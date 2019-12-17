import { Test, TestingModule } from '@nestjs/testing';
import { HabrParserService } from './habrParser.service';
import { habrMock } from './habrData1.mock';
import { habrMockParsed } from './habrData1Parsed.mock';

describe('habrPostGrabber', () => {
  let habrParserService: HabrParserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [HabrParserService],
    }).compile();

    habrParserService = app.get<HabrParserService>(HabrParserService);
  });

  it('WHEN mock loaded THEN should validate it right', async () => {
    const parsed = habrParserService.parse(habrMock);
    expect(parsed).toEqual(habrMockParsed);
  });
});
