import { Test, TestingModule } from '@nestjs/testing';
import { DevtoParserService } from './devtoParser.service';
import { devtoDataMock } from './__mocks__/devtoData1.mock';
import { devtoMockParsed } from './__mocks__/devtoData1Parsed.mock';

describe('DevtoParserService', () => {
  let service: DevtoParserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [DevtoParserService],
    }).compile();

    service = app.get<DevtoParserService>(DevtoParserService);
  });

  it('WHEN mock loaded THEN should parse it right', async () => {
    const parsed = service.parse(devtoDataMock as any);
    expect(parsed).toEqual(devtoMockParsed);
  });
});
