import { Test, TestingModule } from '@nestjs/testing';
import { MediumParserService } from './mediumParser.service';
import { mediumData1Mock } from './mediumData1.mock';
import { mediumData1Parsed } from './mediumData1Parsed.mock';

describe('mediumPostGrabber', () => {
  let mediumParserService: MediumParserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [MediumParserService],
    }).compile();

    mediumParserService = app.get<MediumParserService>(MediumParserService);
  });

  it('WHEN mock loaded THEN should parse it right', async () => {
    const parsed = mediumParserService.parse(mediumData1Mock as any);
    expect(parsed).toEqual(mediumData1Parsed);
  });
});
