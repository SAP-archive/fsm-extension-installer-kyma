import { HttpModule, Module } from '@nestjs/common';
import { ExtensionCatalogService } from './extensioncatalogservice.service';
import { ExtensionInstallerLoggerModule } from '../utils/logger/extension-installer-logger.module';

@Module({
  imports: [HttpModule, ExtensionInstallerLoggerModule],
  providers: [ExtensionCatalogService],
  exports: [ExtensionCatalogService]
})
export class ExtensionCatalogServiceModule {}
