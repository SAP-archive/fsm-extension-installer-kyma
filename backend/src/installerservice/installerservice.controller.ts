import {Controller, Get, HttpCode, HttpStatus, Logger, LoggerService, Post, Req, Res} from '@nestjs/common';
import {Request, Response} from 'express';
import {InstallerService} from './installerservice.service';
import {RequestInstallData, RequestUninstallData} from '../utils/interfaces/requestdata.interface';

@Controller('/api/fsm-extension-installer/v1')
export class InstallerServiceController {
    private readonly loggerService: LoggerService = new Logger(InstallerServiceController.name, true);

    constructor(private readonly installerService: InstallerService) {
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

        this.loggerService.log("Request body:");
        this.loggerService.log(req.body);
        const requestData = {
            accountId: req.body.accountId,
            companyId: req.body.companyId,
            extensionDeploymentId: req.body.extensionDeploymentId
        } as RequestInstallData;

        await this.installerService.installExtension(requestData);
    }

    @Post('/upgrade')
    @HttpCode(HttpStatus.ACCEPTED)
    public async upgradeExtension(@Req() req: Request, @Res() res: Response) {
        res.send('Accepted upgrade requirement.').end();

        this.loggerService.log("Request body:");
        this.loggerService.log(req.body);
        const requestData = {
            accountId: req.body.accountId,
            companyId: req.body.companyId,
            extensionDeploymentId: req.body.extensionDeploymentId
        } as RequestInstallData;

        await this.installerService.upgradeExtension(requestData);
    }

    @Post('/uninstall')
    @HttpCode(HttpStatus.ACCEPTED)
    public async uninstallExtension(@Req() req: Request, @Res() res: Response) {
        res.send('Accepted uninstall requirement.').end();

        this.loggerService.log("Request body:");
        this.loggerService.log(req.body);
        const requestData = {
            accountId: req.body.accountId,
            companyId: req.body.companyId,
            releaseName: req.body.helmRelease,
            namespace: req.body.namespace
        } as RequestUninstallData;
        await this.installerService.uninstallExtension(requestData);
    }
}
