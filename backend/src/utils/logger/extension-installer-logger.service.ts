import { HttpService, Injectable, Logger, Scope } from '@nestjs/common';
import { LoggingTypes } from 'src/utils/enums/logging-types';
import { RequestData } from 'src/utils/interfaces/requestdata.interface';
import { KYMA_SERVICE_CLASS_GATEWAY_URL } from 'src/utils/constants';
import { AxiosRequestConfig } from 'axios';

@Injectable({ scope: Scope.TRANSIENT })
export class ExtensionInstallerLoggerService extends Logger {

  constructor(private readonly httpService: HttpService) {
    super(null, true);
  }

  log(message: any, context?: string, requestData?: RequestData) {
    if (requestData) {
      this.sendLogsToExtensionCatalog(message, LoggingTypes.LOG, requestData).then();
    }
    super.log(message, context ? context : null);
  }
  error(message: any, trace?: string, context?: string, requestData?: RequestData) {
    if (requestData) {
      this.sendLogsToExtensionCatalog(message, LoggingTypes.ERROR, requestData).then();
    }
    super.error(message, trace ? trace : null, context ? context : null);
  }
  warn(message: any, context?: string, requestData?: RequestData) {
    if (requestData) {
      this.sendLogsToExtensionCatalog(message, LoggingTypes.WARN, requestData).then();
    }
    super.warn(message, context ? context : null);
  }
  debug(message: any, context?: string, requestData?: RequestData) {
    if (requestData) {
      this.sendLogsToExtensionCatalog(message, LoggingTypes.DEBUG, requestData).then();
    }
    super.debug(message, context ? context : null);
  }
  verbose(message: any, context?: string, requestData?: RequestData) {
    if (requestData) {
      this.sendLogsToExtensionCatalog(message, LoggingTypes.VERBOSE, requestData).then();
    }
    super.verbose(message, context ? context : null);
  }

  private async sendLogsToExtensionCatalog(message: string, logType: LoggingTypes, requestData: RequestData) {
    try {
      const url = KYMA_SERVICE_CLASS_GATEWAY_URL + '/api/extension-catalog/v1/extension-installers/log';

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': requestData.accountId,
          'X-Company-Id': requestData.companyId
        }
      } as AxiosRequestConfig;

      const data = {
        logMessage: JSON.stringify(message),
        logType: logType
      }

      await this.httpService.post(url, data, config).toPromise();
    } catch (error) {
      throw error;
    }
  }
}
