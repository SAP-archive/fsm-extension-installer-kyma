import { Module } from '@nestjs/common';
import { KubectlService } from './kubectl.service';
import { CmdhelperServiceModule } from '../cmdhelper/cmdhelper.module';

@Module({
  providers: [KubectlService],
  exports: [KubectlService],
  imports: [CmdhelperServiceModule]
})
export class KubectlModule {}
