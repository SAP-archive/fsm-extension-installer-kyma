import fse = require('fs-extra');
import download = require('download-git-repo');
import empty = require('is-empty');
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { ChartConfigData } from '../utils/interfaces/chartconfigdata.interface';
import { CHART_CACHE_PATH } from '../utils/constants';
import { ExtensionInstallerLoggerService } from '../utils/logger/extension-installer-logger.service';
import { RequestData } from '../utils/interfaces/requestdata.interface';

@Injectable()
export class ChartserviceService {

    constructor(private readonly loggerService: ExtensionInstallerLoggerService) {
        this.loggerService.setContext(ChartserviceService.name);
        this.prepareStoredPath4Chart();
    }

    public async downloadChartFromGithubRepo(chartConfigData: ChartConfigData, requestData: RequestData): Promise<string> {
        this.loggerService.log(`ChartConfigData: ${JSON.stringify(chartConfigData)}`, null, requestData);
        const repo = 'direct:' + chartConfigData.repository + (!empty(chartConfigData.ref) ? ('#' + chartConfigData.ref) : '');
        const dest = CHART_CACHE_PATH + uuidv4();

        try {
            return await new Promise((resolve, reject) => {
                download(repo, dest, {clone: true}, function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(dest);
                    }
                });
            });
        } catch (err) {
            this.loggerService.error(err.toString(), null, null, requestData);
            throw err;
        }
    }

    public removeDownloadedPath(path: string) {
        if (fse.existsSync(path)) {
            fse.removeSync(path);
        }
    }

    private prepareStoredPath4Chart(): string {
        if (!fse.existsSync(CHART_CACHE_PATH)) {
            fse.mkdirSync(CHART_CACHE_PATH);
        }

        return CHART_CACHE_PATH;
    }
}
