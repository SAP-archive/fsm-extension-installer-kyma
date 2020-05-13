import { Test, TestingModule } from '@nestjs/testing';
import { ChartserviceService } from './chartservice.service';

describe('ChartserviceService', () => {
  let service: ChartserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartserviceService],
    }).compile();

    service = module.get<ChartserviceService>(ChartserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
