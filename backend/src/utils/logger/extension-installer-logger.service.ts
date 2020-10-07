import { Injectable, Logger, Scope } from '@nestjs/common';
import { ExtensionCatalogService } from 'src/extensioncatalogservice/extensioncatalogservice.service';
import { LoggingTypes } from 'src/utils/enums/logging-types';
import { RequestData } from 'src/utils/interfaces/requestdata.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class ExtensionInstallerLoggerService extends Logger {

  constructor(private readonly extensionCatalogService: ExtensionCatalogService) {
    super(null, true);
  }

  log(message: any, context: string, requestData?: RequestData) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.LOG, requestData);
    super.log(message, context);
  }
  error(message: any, trace: string, context: string, requestData?: RequestData) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.ERROR, requestData);
    super.error(message, trace, context);
  }
  warn(message: any, context: string, requestData?: RequestData) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.WARN, requestData);
    super.warn(message, context);
  }
  debug(message: any, context: string, requestData?: RequestData) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.DEBUG, requestData);
    super.debug(message, context);
  }
  verbose(message: any, context: string, requestData?: RequestData) {
    this.extensionCatalogService.sendLogsToExtensionCatalog(message, LoggingTypes.VERBOSE, requestData);
    super.verbose(message, context);
  }
}
