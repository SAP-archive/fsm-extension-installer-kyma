import { AllExceptionsFilter } from './all-exceptions.filter';
import {ArgumentsHost, HttpStatus} from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  const allExceptionsFilter = new AllExceptionsFilter<Error>();
  const error = new Error('test exception');
  const response = {
    statusCode: undefined
  };
  let mockHostObject: ArgumentsHost = null;
  let spy4handleUnknownError = null;

  beforeEach(() => {
    mockHostObject = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValueOnce(response),
        getRequest: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn()
    };

    spy4handleUnknownError = jest.spyOn(allExceptionsFilter, 'handleUnknownError').mockReturnThis();
  });

  afterEach(() => {
    spy4handleUnknownError.mockRestore();
  });

  it('should be invoked for catch, due to statusCode is null', () => {
    response.statusCode = null;

    allExceptionsFilter.catch(error, mockHostObject);
    expect(spy4handleUnknownError).toBeCalled();
  });

  it('should be invoked for catch, due to statusCode is not 202', () => {
    response.statusCode = HttpStatus.OK;

    allExceptionsFilter.catch(error, mockHostObject);
    expect(spy4handleUnknownError).toBeCalled();
  });

  it('should be invoked for catch, due to statusCode is 202', () => {
    response.statusCode = HttpStatus.ACCEPTED;

    allExceptionsFilter.catch(error, mockHostObject);
    expect(spy4handleUnknownError).toBeCalledTimes(0);
  });
});
