import {ArgumentsHost, Catch, HttpStatus, Logger, LoggerService} from '@nestjs/common';
import {BaseExceptionFilter} from '@nestjs/core';

@Catch()
export class AllExceptionsFilter<T> extends BaseExceptionFilter {
    private readonly loggerService: LoggerService =
        new Logger(AllExceptionsFilter.name, true);

    catch(exception: T, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();
        if (!response.statusCode || response.statusCode !== HttpStatus.ACCEPTED) {
            super.catch(exception, host);
        }

        this.loggerService.error(exception);
        this.loggerService.error('Close current workflow due to throw an exception.');
    }
}
