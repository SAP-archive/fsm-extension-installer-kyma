import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ExtensionInstallerLoggerService } from './logger/extension-installer-logger.service';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { RequestData } from './interfaces/requestdata.interface';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {

    constructor(private readonly loggerService: ExtensionInstallerLoggerService) {
        super();
        this.loggerService.setContext(AllExceptionsFilter.name);
    }

    catch(exception: any, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();

        if (!response.statusCode || response.statusCode !== HttpStatus.ACCEPTED) {
            super.catch(exception, host);
        }

        const requestData: RequestData = {
            accountId: request.body.accountId,
            companyId: request.body.companyId
        }

        this.loggerService.error(`Closing the current workflow due to exception: ${exception}`, null, null, requestData);
    }
}
