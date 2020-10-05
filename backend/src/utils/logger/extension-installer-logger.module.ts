import { Module } from '@nestjs/common';
import { ExtensionInstallerLogger } from 'src/utils/logger/extension-installer-logger';

@Module({
  providers: [ExtensionInstallerLogger],
  exports: [ExtensionInstallerLogger],
})
export class ExtensionInstallerLoggerModule {
}
