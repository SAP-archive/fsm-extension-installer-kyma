import { HttpModule, Module } from '@nestjs/common';
import { ExtensionInstallerLoggerService } from './extension-installer-logger.service';

@Module({
  imports: [HttpModule],
  providers: [ExtensionInstallerLoggerService],
  exports: [ExtensionInstallerLoggerService],
})
export class ExtensionInstallerLoggerModule {
}
