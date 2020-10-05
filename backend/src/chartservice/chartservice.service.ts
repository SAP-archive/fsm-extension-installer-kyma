import fse = require('fs-extra');
import download = require('download-git-repo');
import empty = require('is-empty');
import { v4 as uuidv4 } from 'uuid';
import { Injectable, LoggerService } from '@nestjs/common';

import { ChartConfigData } from '../utils/interfaces/chartconfigdata.interface';
import { CHART_CACHE_PATH } from '../utils/constants';
import { ExtensionInstallerLogger } from 'src/utils/logger/extension-installer-logger';

@Injectable()
export class ChartserviceService {
    private readonly loggerService: LoggerService = new ExtensionInstallerLogger(ChartserviceService.name, true);

    constructor() {
        this.prepareStoredPath4Chart();
    }

    public async downloadChartFromGithubRepo(chartConfigData: ChartConfigData): Promise<string> {
        this.loggerService.log("ChartConfigData:");
        this.loggerService.log(chartConfigData);
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
            this.loggerService.error(err.toString());
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
