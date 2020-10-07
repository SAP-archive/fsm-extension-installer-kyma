import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ExtensionInstallerLoggerService } from 'src/utils/logger/extension-installer-logger.service';

@Catch()
export class AllExceptionsFilter<T> extends BaseExceptionFilter {

    constructor(private readonly loggerService: ExtensionInstallerLoggerService) {
        super();
        this.loggerService.setContext(AllExceptionsFilter.name);
    }

    catch(exception: T, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();
        if (!response.statusCode || response.statusCode !== HttpStatus.ACCEPTED) {
            super.catch(exception, host);
        }

        // TODO: impossible to get request context in application (global) filter, logging with custom logger like this not possible
        // this.loggerService.error(exception);
        // this.loggerService.error('Close current workflow due to throw an exception.');
    }
}
