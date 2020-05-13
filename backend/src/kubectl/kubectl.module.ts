import { Module } from '@nestjs/common';
import { KubectlService } from './kubectl.service';

@Module({
  providers: [KubectlService],
  exports: [KubectlService]
})
export class KubectlModule {}
