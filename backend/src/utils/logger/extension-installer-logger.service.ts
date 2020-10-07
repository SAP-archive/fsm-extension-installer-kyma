import { Injectable, Logger, Scope } from '@nestjs/common';
import { ExtensionCatalogService } from 'src/extensioncatalogservice/extensioncatalogservice.service';
import { LoggingTypes } from 'src/utils/enums/logging-types';

@Injectable({ scope: Scope.TRANSIENT })
export class ExtensionInstallerLoggerService extends Logger {

  constructor(private readonly extensionCatalogService: ExtensionCatalogService) {
    super(null, true);
  }

  log(message: any) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.LOG)
    super.log(message);
  }
  error(message: any) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.ERROR)
    super.error(message);
  }
  warn(message: any) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.WARN)
    super.warn(message);
  }
  debug(message: any) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.DEBUG)
    super.debug(message);
  }
  verbose(message: any) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.VERBOSE)
    super.verbose(message);
  }
}
