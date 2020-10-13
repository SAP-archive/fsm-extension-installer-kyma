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

        // this will not be logged into infrastructure, only in Kyma environment, since no request-context is available
        this.loggerService.error(exception);
        this.loggerService.error('Close current workflow due to throw an exception.');
    }
}
