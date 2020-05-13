import { Test, TestingModule } from '@nestjs/testing';
import { InstallerServiceController } from './installerservice.controller';

describe('InstallerServiceController', () => {
  let controller: InstallerServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallerServiceController],
    }).compile();

    controller = module.get<InstallerServiceController>(InstallerServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
