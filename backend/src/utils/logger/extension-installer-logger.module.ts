import { forwardRef, Module } from '@nestjs/common';
import { ExtensionInstallerLoggerService } from 'src/utils/logger/extension-installer-logger.service';
import { ExtensionCatalogServiceModule } from 'src/extensioncatalogservice/extensioncatalogservice.module';

@Module({
  imports: [forwardRef(() => ExtensionCatalogServiceModule)],
  providers: [ExtensionInstallerLoggerService],
  exports: [ExtensionInstallerLoggerService],
})
export class ExtensionInstallerLoggerModule {
}
