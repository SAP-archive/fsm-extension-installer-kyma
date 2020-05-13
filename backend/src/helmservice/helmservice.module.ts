import { Module } from '@nestjs/common';
import { HelmserviceService } from './helmservice.service';
import { CmdhelperServiceModule } from '../cmdhelper/cmdhelper.module';

@Module({
  providers: [HelmserviceService],
  exports: [HelmserviceService],
  imports: [CmdhelperServiceModule]
})
export class HelmserviceModule {}
