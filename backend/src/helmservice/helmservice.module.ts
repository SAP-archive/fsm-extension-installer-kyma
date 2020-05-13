import { Module } from '@nestjs/common';
import { HelmserviceService } from './helmservice.service';

@Module({
  providers: [HelmserviceService],
  exports: [HelmserviceService]
})
export class HelmserviceModule {}
