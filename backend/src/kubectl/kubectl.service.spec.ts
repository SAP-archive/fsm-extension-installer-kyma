import { Test, TestingModule } from '@nestjs/testing';
import { KubectlService } from './kubectl.service';

describe('KubectlService', () => {
  let service: KubectlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KubectlService],
    }).compile();

    service = module.get<KubectlService>(KubectlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
