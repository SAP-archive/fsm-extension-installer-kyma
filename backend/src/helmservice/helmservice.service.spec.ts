import { Test, TestingModule } from '@nestjs/testing';
import { HelmserviceService } from './helmservice.service';

describe('HelmserviceService', () => {
  let service: HelmserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelmserviceService],
    }).compile();

    service = module.get<HelmserviceService>(HelmserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
