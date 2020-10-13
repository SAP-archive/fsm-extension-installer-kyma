import { Injectable } from '@nestjs/common';
import { ExtensionCatalogService } from '../extensioncatalogservice/extensioncatalogservice.service';
import { ChartserviceService } from '../chartservice/chartservice.service';
import { HelmserviceService } from '../helmservice/helmservice.service';
import { HelmBaseOptions, HelmDeployOptions } from '../utils/interfaces/helmperformoptions.interface';
import { DeployConfigData } from '../utils/interfaces/deployconfigdata.interface';
import { UpdatedDeployData } from '../utils/interfaces/updateddeploydata.interface';
import { DeployResultData } from '../utils/interfaces/deployresultdata.interface';
import { KubectlService } from '../kubectl/kubectl.service';
import { RequestData, RequestInstallData, RequestUninstallData } from '../utils/interfaces/requestdata.interface';
import { ExtensionInstallerLoggerService } from 'src/utils/logger/extension-installer-logger.service';
import yamljs = require('yamljs');
import search = require('recursive-search');
import path = require('path');

@Injectable()
export class InstallerService {

    constructor(private readonly extensionCatalogService: ExtensionCatalogService,
                private readonly chartserviceService: ChartserviceService,
                private readonly helmserviceService: HelmserviceService,
                private readonly kubectlService: KubectlService,
                private readonly loggerService: ExtensionInstallerLoggerService) {
        this.loggerService.setContext(InstallerService.name);
    }

    public async installExtension(requestData: RequestInstallData) {
        this.loggerService.log("Begin to install extension application ...", null, requestData);
        return await this.deployExtension(requestData, false);
    }

    public async upgradeExtension(requestData: RequestInstallData) {
        this.loggerService.log("Begin to upgrade extension application ...", null, requestData);
        return await this.deployExtension(requestData, true);
    }

    public async uninstallExtension(requestData: RequestUninstallData) {
        this.loggerService.log("Begin to uninstall extension application ...", null, requestData);

        await this.helmserviceService.delete({releaseName: requestData.releaseName,
            namespace: requestData.namespace} as HelmBaseOptions, requestData);

        this.loggerService.log('Successfully finish uninstall workflow.', null, requestData);
    }

    private getReleaseName(chartPath: string, requestData: RequestData): string {
        try {
            const chartFile = `${chartPath}/Chart.yaml`;
            const chartObject = yamljs.load(chartFile);
            if (!chartObject || !chartObject.name) {
                throw new Error(`Name is required in Chart.yaml file.`);
            }

            return chartObject.name;
        } catch (error) {
            this.loggerService.error(error.toString(), null, null, requestData);
            throw error;
        }
    }

    private async deployExtension(requestData: RequestInstallData, isUpgradeFlow: boolean) {
        let repoLocalPath: string = null;
        try {
            let stepNum = 1;
            this.loggerService.log(`Step${stepNum++}, Get deployment configuration data via deploymentId from Extension Catalog service.`, null, requestData);
            const deployConfigData: DeployConfigData =
                await this.extensionCatalogService.getDeploymentConfigData(requestData);

            this.loggerService.log(`Step${stepNum++}, Download helm chart from github repository.`, null, requestData);
            repoLocalPath = await this.chartserviceService.downloadChartFromGithubRepo(deployConfigData.chartConfigData, requestData);

            this.loggerService.log(`Step${stepNum++}, Using helm-cli to install extension app to Kyma cluster.`, null, requestData);
            const result = await this.installOperation(repoLocalPath, deployConfigData, isUpgradeFlow, requestData);
            const helmResult = JSON.parse(result);

            this.loggerService.log(`Step${stepNum++}, Get access url from Kyma cluster via virtualservice api-resource type.`, null, requestData);
            const accessUrl = await this.kubectlService.getAccessUrlFromKymaByAppName(helmResult.name, helmResult.namespace, requestData);

            this.loggerService.log(`Step${stepNum++}, Update state:${this.getDeployState(isUpgradeFlow, accessUrl)} to Extension Catalog service via API call.`, null, requestData);
            const updatedDeployData = this.buildUpdatedDeployInfo(requestData,
                this.getDeployState(isUpgradeFlow, accessUrl), deployConfigData.appVersion, accessUrl);
            await this.extensionCatalogService.updateDeploymentInfoToCatalog(updatedDeployData);

            this.loggerService.log(`Step${stepNum++}, Add helmRelease:${helmResult.name} and namespace:${helmResult.namespace} to Extension Deployment Result table.`, null, requestData);
            await this.updateHelmValueToDeploymentResult(requestData, helmResult);

            this.loggerService.log(`Successfully finish install or upgrade workflow!`, null, requestData);
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

    private async installOperation(repoPath: string,
                                   deployConfigData: DeployConfigData,
                                   isUpgradeFlow: boolean,
                                   requestData: RequestData) {
        //Build deployment options
        const helmChartPath = this.getHelmChartsPath(repoPath, deployConfigData.chartConfigData.path);
        const helmDeployOptions = {
            releaseName: this.getReleaseName(helmChartPath, requestData),
            chartLocation: helmChartPath,
            namespace: deployConfigData.namespace,
            values: deployConfigData.parameterValues
        } as HelmDeployOptions;

        //Enhancement that delete it if exist this helm release in Kyma cluster
        await this.deleteOldHelmRelease({
            releaseName: isUpgradeFlow ? deployConfigData.lastHelmContent.helmRelease : helmDeployOptions.releaseName,
            namespace: isUpgradeFlow ? deployConfigData.lastHelmContent.namespace : helmDeployOptions.namespace
        } as HelmBaseOptions, requestData);

        //Install or upgrade new helm release
        this.loggerService.log("HelmDeployOptions:", null, requestData);
        this.loggerService.log(helmDeployOptions, null, requestData);
        const response = await this.helmserviceService.install(helmDeployOptions, requestData);
        if (response.stderr) {
            throw new Error(response.stderr);
        } else {
            return response.stdout;
        }
    }

    private async deleteOldHelmRelease(helmOptions: HelmBaseOptions, requestData: RequestData) {
        this.loggerService.log(`Try to delete old release via releaseName:${helmOptions.releaseName} and 
        namespace:${helmOptions.namespace} for upgrade workflow.`, null, requestData);
        if (await this.helmserviceService.exist(helmOptions, requestData)) {
            await this.helmserviceService.delete(helmOptions, requestData);
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
