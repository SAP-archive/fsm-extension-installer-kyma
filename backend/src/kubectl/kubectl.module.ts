import { Module } from '@nestjs/common';
import { KubectlService } from './kubectl.service';
import { CmdhelperServiceModule } from '../cmdhelper/cmdhelper.module';
import { ExtensionInstallerLoggerModule } from 'src/utils/logger/extension-installer-logger.module';

@Module({
  imports: [CmdhelperServiceModule, ExtensionInstallerLoggerModule],
  providers: [KubectlService],
  exports: [KubectlService]
})
export class KubectlModule {}
