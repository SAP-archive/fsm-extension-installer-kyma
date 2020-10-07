import { Module } from '@nestjs/common';
import { InstallerServiceModule } from './installerservice/installerservice.module';
import { ExtensionInstallerLoggerModule } from 'src/utils/logger/extension-installer-logger.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/utils/all-exceptions.filter';

@Module({
  imports: [InstallerServiceModule, ExtensionInstallerLoggerModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
