import { Test, TestingModule } from '@nestjs/testing';
import { ExtensionCatalogService } from './extensioncatalogservice.service';

describe('ExtensionCatalogService', () => {
  let service: ExtensionCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtensionCatalogService],
    }).compile();

    service = module.get<ExtensionCatalogService>(ExtensionCatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
