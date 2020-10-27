import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ExtensionInstallerLoggerService } from './logger/extension-installer-logger.service';
import { RequestData } from 'src/utils/interfaces/requestdata.interface';
import { BaseExceptionFilter } from '@nestjs/core';

const baseCatchSpy = jest.spyOn(BaseExceptionFilter.prototype, 'catch').mockImplementation(() => ({}));
const mockExtensionInstallerLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn()
};
const mockGetResponse = jest.fn();
const mockRequestBody = { accountId: 'TEST_ACCOUNT_ID', companyId: 'TEST_COMPANY_ID' };
const mockGetRequest = jest.fn().mockImplementation(() => ({
  body: mockRequestBody
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest
}));
const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn()
};

describe('All Exceptions Filter', () => {
  let service: AllExceptionsFilter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseExceptionFilter,
        AllExceptionsFilter,
        {
          provide: ExtensionInstallerLoggerService,
          useValue: mockExtensionInstallerLoggerService
        },
      ]
    }).compile();
    service = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  describe('All exception filter tests', () => {

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should catch the HTTP exception - BAD_REQUEST', () => {
      mockGetResponse.mockImplementationOnce(() => ({
        statusCode: HttpStatus.BAD_REQUEST
      }));
      const exception: HttpException = new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
      const requestData: RequestData = {
        accountId: mockRequestBody.accountId,
        companyId: mockRequestBody.companyId
      }

      service.catch(exception, mockArgumentsHost);

      expect(mockHttpArgumentsHost).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledWith();
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(mockGetRequest).toBeCalledWith();
      expect(baseCatchSpy).toHaveBeenCalledTimes(1);
      expect(baseCatchSpy).toHaveBeenCalledWith(exception, mockArgumentsHost);
      expect(mockExtensionInstallerLoggerService.error).toHaveBeenCalledTimes(1);
      expect(mockExtensionInstallerLoggerService.error).toHaveBeenCalledWith(
        `Closing the current workflow due to exception: ${exception}`,
        null,
        null,
        requestData
      );
    });

    it('should catch the exception - no statusCode', () => {
      mockGetResponse.mockImplementationOnce(() => ({}));
      const exception: HttpException = new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
      const requestData: RequestData = {
        accountId: mockRequestBody.accountId,
        companyId: mockRequestBody.companyId
      }

      service.catch(exception, mockArgumentsHost);

      expect(mockHttpArgumentsHost).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledWith();
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(mockGetRequest).toBeCalledWith();
      expect(baseCatchSpy).toHaveBeenCalledTimes(1);
      expect(baseCatchSpy).toHaveBeenCalledWith(exception, mockArgumentsHost);
      expect(mockExtensionInstallerLoggerService.error).toHaveBeenCalledTimes(1);
      expect(mockExtensionInstallerLoggerService.error).toHaveBeenCalledWith(
        `Closing the current workflow due to exception: ${exception}`,
        null,
        null,
        requestData
      );
    });

    it('should catch the exception but not call super.catch - HttpStatus.ACCEPTED', () => {
      mockGetResponse.mockImplementationOnce(() => ({
        statusCode: HttpStatus.ACCEPTED
      }));
      const exception: HttpException = new HttpException('ACCEPTED', HttpStatus.ACCEPTED);
      const requestData: RequestData = {
        accountId: mockRequestBody.accountId,
        companyId: mockRequestBody.companyId
      }

      service.catch(exception, mockArgumentsHost);

      expect(mockHttpArgumentsHost).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledWith();
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(mockGetRequest).toBeCalledWith();
      expect(baseCatchSpy).not.toHaveBeenCalled();
      expect(mockExtensionInstallerLoggerService.error).toHaveBeenCalledTimes(1);
      expect(mockExtensionInstallerLoggerService.error).toHaveBeenCalledWith(
        `Closing the current workflow due to exception: ${exception}`,
        null,
        null,
        requestData
      );
    });
  });
});
