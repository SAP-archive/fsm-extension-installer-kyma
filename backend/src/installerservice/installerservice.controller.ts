import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InstallerService } from './installerservice.service';
import { RequestInstallData, RequestUninstallData } from '../utils/interfaces/requestdata.interface';
import { ExtensionInstallerLoggerService } from '../utils/logger/extension-installer-logger.service';

@Controller('/api/fsm-extension-installer/v1')
export class InstallerServiceController {

    constructor(private readonly installerService: InstallerService,
                private readonly loggerService: ExtensionInstallerLoggerService) {
        this.loggerService.setContext(InstallerServiceController.name);
    }

    @Get('/status')
    @HttpCode(HttpStatus.OK)
    public getProbeValue() {
        return `It's ok now.`;
    }

    @Post('/install')
    @HttpCode(HttpStatus.ACCEPTED)
    public async installExtension(@Req() req: Request, @Res() res: Response) {
        res.send('Accepted install requirement.').end();

        const requestData = {
            accountId: req.body.accountId,
            companyId: req.body.companyId,
            extensionDeploymentId: req.body.extensionDeploymentId
        } as RequestInstallData;

        this.loggerService.log(`Request body: ${JSON.stringify(req.body)}`, null, requestData);

        await this.installerService.installExtension(requestData);
    }

    @Post('/upgrade')
    @HttpCode(HttpStatus.ACCEPTED)
    public async upgradeExtension(@Req() req: Request, @Res() res: Response) {
        res.send('Accepted upgrade requirement.').end();

        const requestData = {
            accountId: req.body.accountId,
            companyId: req.body.companyId,
            extensionDeploymentId: req.body.extensionDeploymentId
        } as RequestInstallData;

        this.loggerService.log(`Request body: ${JSON.stringify(req.body)}`, null, requestData);

        await this.installerService.upgradeExtension(requestData);
    }

    @Post('/uninstall')
    @HttpCode(HttpStatus.ACCEPTED)
    public async uninstallExtension(@Req() req: Request, @Res() res: Response) {
        res.send('Accepted uninstall requirement.').end();

        const requestData = {
            accountId: req.body.accountId,
            companyId: req.body.companyId,
            releaseName: req.body.helmRelease,
            namespace: req.body.namespace
        } as RequestUninstallData;

        this.loggerService.log(`Request body: ${JSON.stringify(req.body)}`, null, requestData);

        await this.installerService.uninstallExtension(requestData);
    }
}
