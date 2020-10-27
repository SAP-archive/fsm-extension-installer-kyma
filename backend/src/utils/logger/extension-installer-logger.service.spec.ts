import { Test, TestingModule } from '@nestjs/testing';
import { HttpService, Logger } from '@nestjs/common';
import { ExtensionInstallerLoggerService } from './extension-installer-logger.service';
import { RequestData } from '../interfaces/requestdata.interface';
import { LoggingTypes } from '../enums/logging-types';
import { KYMA_SERVICE_CLASS_GATEWAY_URL } from '../constants';
import { AxiosRequestConfig } from 'axios';
import { of } from 'rxjs';

const message = 'TEST_MESSAGE';
const context = 'TEST_CONTEXT';
const trace = 'TEST_TRACE';
const url = KYMA_SERVICE_CLASS_GATEWAY_URL + '/api/extension-catalog/v1/extension-installers/log';
const requestData: RequestData = { accountId: 'ACCOUNT_ID', companyId: 'COMPANY_ID' };
const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-Account-Id': requestData.accountId,
    'X-Company-Id': requestData.companyId
  }
} as AxiosRequestConfig;
const mockHttpService = {
  post: jest.fn().mockImplementation(() => (of({})))
};
const baseLoggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => ({}));
const baseLoggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => ({}));
const baseLoggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => ({}));
const baseLoggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => ({}));
const baseLoggerVerboseSpy = jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => ({}));

describe('Extension Installer Logger Service', () => {
  let service: ExtensionInstallerLoggerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtensionInstallerLoggerService,
        {
          provide: HttpService,
          useValue: mockHttpService
        },
      ]
    }).compile();
    service = await module.resolve<ExtensionInstallerLoggerService>(ExtensionInstallerLoggerService);
  });

  describe('All ExtensionInstallerLoggerService tests', () => {

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should handle message of level: LOG w/ context & requestData', () => {
      const data = { logMessage: JSON.stringify(message), logType: LoggingTypes.LOG };

      service.log(message, context, requestData);

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledWith(url, data, config);
      // super.log is called 1 time independently, therefore 2 invocations
      expect(baseLoggerLogSpy).toHaveBeenCalledTimes(2);
      expect(baseLoggerLogSpy).toHaveBeenCalledWith(message, context);
    });

    it('should handle message of level: LOG w/o context & requestData', () => {
      service.log(message);

      expect(mockHttpService.post).not.toHaveBeenCalled();
      // super.log is called 1 time independently, therefore 2 invocations
      expect(baseLoggerLogSpy).toHaveBeenCalledTimes(2);
      expect(baseLoggerLogSpy).toHaveBeenCalledWith(message, null);
    });

    it('should handle message of level: ERROR w/ trace & context & requestData', () => {
      const data = { logMessage: JSON.stringify(message), logType: LoggingTypes.ERROR };

      service.error(message, trace, context, requestData);

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledWith(url, data, config);
      expect(baseLoggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerErrorSpy).toHaveBeenCalledWith(message, trace, context);
    });

    it('should handle message of level: ERROR w/o trace & context & requestData', () => {
      service.error(message);

      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(baseLoggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerErrorSpy).toHaveBeenCalledWith(message, null, null);
    });

    it('should handle message of level: WARN w/ context & requestData', () => {
      const data = { logMessage: JSON.stringify(message), logType: LoggingTypes.WARN };

      service.warn(message, context, requestData);

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledWith(url, data, config);
      expect(baseLoggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerWarnSpy).toHaveBeenCalledWith(message, context);
    });

    it('should handle message of level: WARN w/o context & requestData', () => {
      service.warn(message);

      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(baseLoggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerWarnSpy).toHaveBeenCalledWith(message, null);
    });

    it('should handle message of level: DEBUG w/ context & requestData', () => {
      const data = { logMessage: JSON.stringify(message), logType: LoggingTypes.DEBUG };

      service.debug(message, context, requestData);

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledWith(url, data, config);
      expect(baseLoggerDebugSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerDebugSpy).toHaveBeenCalledWith(message, context);
    });

    it('should handle message of level: DEBUG w/o context & requestData', () => {
      service.debug(message);

      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(baseLoggerDebugSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerDebugSpy).toHaveBeenCalledWith(message, null);
    });

    it('should handle message of level: VERBOSE w/ context & requestData', () => {
      const data = { logMessage: JSON.stringify(message), logType: LoggingTypes.VERBOSE };

      service.verbose(message, context, requestData);

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledWith(url, data, config);
      expect(baseLoggerVerboseSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerVerboseSpy).toHaveBeenCalledWith(message, context);
    });

    it('should handle message of level: VERBOSE w/o context & requestData', () => {
      service.verbose(message);

      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(baseLoggerVerboseSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerVerboseSpy).toHaveBeenCalledWith(message, null);
    });

    it('should catch error when failing to post to microservice', () => {
      service.log(message);

      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(baseLoggerVerboseSpy).toHaveBeenCalledTimes(1);
      expect(baseLoggerVerboseSpy).toHaveBeenCalledWith(message, null);
    });
  });
});
