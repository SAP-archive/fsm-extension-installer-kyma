import {ArgumentsHost, Catch, Logger, LoggerService} from '@nestjs/common';
import {BaseExceptionFilter} from '@nestjs/core';

@Catch()
export class AllExceptionsFilter<T> extends BaseExceptionFilter {
    private readonly loggerService: LoggerService =
        new Logger(AllExceptionsFilter.name, true);

    catch(exception: T, host: ArgumentsHost) {
        //super.catch(exception, host);

        this.loggerService.error('Close current workflow due to throw an exception.');
    }
}
