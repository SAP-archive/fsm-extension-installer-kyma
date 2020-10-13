import { Module } from '@nestjs/common';
import { HelmserviceService } from './helmservice.service';
import { CmdhelperServiceModule } from '../cmdhelper/cmdhelper.module';
import { ExtensionInstallerLoggerModule } from 'src/utils/logger/extension-installer-logger.module';

@Module({
  imports: [CmdhelperServiceModule, ExtensionInstallerLoggerModule],
  providers: [HelmserviceService],
  exports: [HelmserviceService]
})
export class HelmserviceModule {}
