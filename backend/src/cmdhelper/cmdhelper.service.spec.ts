import { Test, TestingModule } from '@nestjs/testing';
import { CmdhelperService } from './cmdhelper.service';

describe('CmdhelperService', () => {
  let service: CmdhelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmdhelperService],
    }).compile();

    service = module.get<CmdhelperService>(CmdhelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
