import { Module } from '@nestjs/common';
import { ChartserviceService } from './chartservice.service';
import { ExtensionInstallerLoggerModule } from '../utils/logger/extension-installer-logger.module';

@Module({
  imports: [ExtensionInstallerLoggerModule],
  providers: [ChartserviceService],
  exports: [ChartserviceService]
})
export class ChartServiceModule {}
