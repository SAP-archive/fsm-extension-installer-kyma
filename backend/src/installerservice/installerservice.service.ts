import { Injectable, LoggerService, Logger } from '@nestjs/common';
import yamljs = require('yamljs');
import search = require('recursive-search');
import path = require('path');
import {ExtensionCatalogService} from '../extensioncatalogservice/extensioncatalogservice.service';
import {ChartserviceService} from '../chartservice/chartservice.service';
import {HelmserviceService} from '../helmservice/helmservice.service';
import {HelmBaseOptions, HelmDeployOptions} from '../utils/interfaces/helmperformoptions.interface';
import {DeployConfigData} from '../utils/interfaces/deployconfigdata.interface';
import {UpdatedDeployData} from '../utils/interfaces/updateddeploydata.interface';
import {DeployResultData} from '../utils/interfaces/deployresultdata.interface';
import {KubectlService} from '../kubectl/kubectl.service';
import {RequestInstallData, RequestUninstallData} from '../utils/interfaces/requestdata.interface';

@Injectable()
export class InstallerService {
    private readonly loggerService: LoggerService = new Logger(InstallerService.name, true);

    constructor(private readonly extensionCatalogService: ExtensionCatalogService,
                private readonly chartserviceService: ChartserviceService,
                private readonly helmserviceService: HelmserviceService,
                private readonly kubectlService: KubectlService) {
    }

    public async installExtension(requestData: RequestInstallData) {
        this.loggerService.log("Begin to install extension application ...");
        return await this.deployExtension(requestData, false);
    }

    public async upgradeExtension(requestData: RequestInstallData) {
        this.loggerService.log("Begin to upgrade extension application ...");
        return await this.deployExtension(requestData, true);
    }

    public async uninstallExtension(requestData: RequestUninstallData) {
        this.loggerService.log("Begin to uninstall extension application ...");

        await this.helmserviceService.delete({releaseName: requestData.releaseName,
            namespace: requestData.namespace} as HelmBaseOptions);

        this.loggerService.log('Successfully finish uninstall workflow.');
    }

    private getReleaseName(chartPath: string): string {
        try {
            const chartFile = `${chartPath}/Chart.yaml`;
            const chartObject = yamljs.load(chartFile);
            if (!chartObject || !chartObject.name) {
                throw new Error(`Name is required in Chart.yaml file.`);
            }

            return chartObject.name;
        } catch (error) {
            this.loggerService.error(error.toString());
            throw error;
        }
    }

    private async deployExtension(requestData: RequestInstallData, isUpgradeFlow: boolean) {
        let repoLocalPath: string = null;
        try {
            let stepNum = 1;
            this.loggerService.log(`Step${stepNum++}, Get deployment configuration data via deploymentId from Extension Catalog service.`);
            const deployConfigData: DeployConfigData =
                await this.extensionCatalogService.getDeploymentConfigData(requestData);

            this.loggerService.log(`Step${stepNum++}, Download helm chart from github repository.`);
            repoLocalPath = await this.chartserviceService.downloadChartFromGithubRepo(deployConfigData.chartConfigData);

            this.loggerService.log(`Step${stepNum++}, Using helm-cli to install extension app to Kyma cluster.`);
            const result = await this.installOperation(repoLocalPath, deployConfigData, isUpgradeFlow);
            const helmResult = JSON.parse(result);

            this.loggerService.log(`Step${stepNum++}, Get access url from Kyma cluster via virtualservice api-resource type.`);
            const accessUrl = await this.kubectlService.getAccessUrlFromKymaByAppName(helmResult.name, helmResult.namespace);

            this.loggerService.log(`Step${stepNum++}, Update state:${this.getDeployState(isUpgradeFlow, accessUrl)} to Extension Catalog service via API call.`);
            const updatedDeployData = this.buildUpdatedDeployInfo(requestData,
                this.getDeployState(isUpgradeFlow, accessUrl), deployConfigData.appVersion, accessUrl);
            await this.extensionCatalogService.updateDeploymentInfoToCatalog(updatedDeployData);

            this.loggerService.log(`Step${stepNum++}, Add helmRelease:${helmResult.name} and namespace:${helmResult.namespace} to Extension Deployment Result table.`);
            await this.updateHelmValueToDeploymentResult(requestData, helmResult);

            this.loggerService.log(`Successfully finish install or upgrade workflow!`);
        } catch (error) {
            const state = isUpgradeFlow ? 'UPDATE_FAILED' : 'INSTALL_FAILED';
            const updatedDeployData = this.buildUpdatedDeployInfo(requestData, state, null, '');
            await this.extensionCatalogService.updateDeploymentInfoToCatalog(updatedDeployData);

            //Record error info to Result table
            await this.updateErrorToDeploymentResult(requestData, error);

            //Throw exception to NestJS framework
            throw error;
        } finally {
            //Clean up current download helm-chart folder
            this.chartserviceService.removeDownloadedPath(repoLocalPath);
        }
    }

    private async updateErrorToDeploymentResult(requestData: RequestInstallData, error: any) {
        const deployResultData = {
            accountId: requestData.accountId,
            companyId: requestData.companyId,
            extensionDeploymentId: requestData.extensionDeploymentId,
            log: error.toString(),
            shortMessage: error.name
        } as DeployResultData;
        await this.extensionCatalogService.addDeploymentResultToCatalog(deployResultData);
    }

    private async updateHelmValueToDeploymentResult(requestData: RequestInstallData, helmResult: any) {
        const deployResultData = {
            accountId: requestData.accountId,
            companyId: requestData.companyId,
            extensionDeploymentId: requestData.extensionDeploymentId,
            log: helmResult.info.notes,
            shortMessage: helmResult.info.description,
            content: {
                helmRelease: helmResult.name,
                namespace: helmResult.namespace
            }
        } as DeployResultData;
        await this.extensionCatalogService.addDeploymentResultToCatalog(deployResultData);
    }

    private async installOperation(repoPath: string, deployConfigData: DeployConfigData, isUpgradeFlow: boolean) {
        //Build deployment options
        const helmChartPath = this.getHelmChartsPath(repoPath, deployConfigData.chartConfigData.path);
        const helmDeployOptions = {
            releaseName: this.getReleaseName(helmChartPath),
            chartLocation: helmChartPath,
            namespace: deployConfigData.namespace,
            values: deployConfigData.parameterValues
        } as HelmDeployOptions;

        //Enhancement that delete it if exist this helm release in Kyma cluster
        await this.deleteOldHelmRelease({
            releaseName: isUpgradeFlow ? deployConfigData.lastHelmContent.helmRelease : helmDeployOptions.releaseName,
            namespace: isUpgradeFlow ? deployConfigData.lastHelmContent.namespace : helmDeployOptions.namespace
        } as HelmBaseOptions);

        //Install or upgrade new helm release
        this.loggerService.log("HelmDeployOptions:");
        this.loggerService.log(helmDeployOptions);
        const response = await this.helmserviceService.install(helmDeployOptions);
        if (response.stderr) {
            throw new Error(response.stderr);
        } else {
            return response.stdout;
        }
    }

    private async deleteOldHelmRelease(helmOptions: HelmBaseOptions) {
        this.loggerService.log(`Try to delete old release via releaseName:${helmOptions.releaseName} and 
        namespace:${helmOptions.namespace} for upgrade workflow.`);
        if (await this.helmserviceService.exist(helmOptions)) {
            await this.helmserviceService.delete(helmOptions);
        }
    }

    private buildUpdatedDeployInfo(requestData: RequestInstallData,
                                   state: string,
                                   version: string,
                                   accessUrl: string): UpdatedDeployData {

        const value = {
            accountId: requestData.accountId,
            companyId: requestData.companyId,
            extensionDeploymentId : requestData.extensionDeploymentId,
            state : state,
            version : version,
            accessUrl : accessUrl
        } as UpdatedDeployData;

        if (!version) {
            delete value.version;
        }

        return value;
    }

    private getDeployState(isUpgradeFlow: boolean, accessUrl: string): string {
        if (isUpgradeFlow) {
            return (accessUrl && accessUrl !== '') ? 'UPDATED' : 'UPDATE_FAILED';
        } else {
            return (accessUrl && accessUrl !== '') ? 'INSTALLED' : 'INSTALL_FAILED';
        }
    }

    private getHelmChartsPath(rootPath: string, chartConfigDataPath: string) {
        let helmChartPath: string;
        if (chartConfigDataPath) {
            helmChartPath = rootPath + '/' + chartConfigDataPath;
        } else {
            const results = search.recursiveSearchSync('Chart.yaml', rootPath);
            if (results.length === 0) {
                throw new Error(`Chart.yaml file is required.`);
            }

            helmChartPath = path.dirname(results[0]);
        }

        return helmChartPath;
    }
}
