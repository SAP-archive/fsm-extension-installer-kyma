import { Test, TestingModule } from '@nestjs/testing';
import { InstallerService } from './installerservice.service';

describe('InstallerService', () => {
  let service: InstallerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallerService],
    }).compile();

    service = module.get<InstallerService>(InstallerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
