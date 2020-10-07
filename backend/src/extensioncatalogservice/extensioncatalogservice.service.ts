import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { DeployConfigData } from '../utils/interfaces/deployconfigdata.interface';
import { UpdatedDeployData } from '../utils/interfaces/updateddeploydata.interface';
import { DeployResultData } from '../utils/interfaces/deployresultdata.interface';
import { ChartConfigData } from '../utils/interfaces/chartconfigdata.interface';
import { RequestData, RequestInstallData } from '../utils/interfaces/requestdata.interface';
import { INSTALLER_NAMESPACE, KYMA_SERVICE_CLASS_GATEWAY_URL } from '../utils/constants';
import { ExtensionInstallerLoggerService } from 'src/utils/logger/extension-installer-logger.service';
import { LoggingTypes } from 'src/utils/enums/logging-types';

@Injectable()
export class ExtensionCatalogService {

  constructor(private readonly loggerService: ExtensionInstallerLoggerService, private readonly httpService: HttpService) {
    loggerService.setContext(ExtensionCatalogService.name);
  }

  public async getDeploymentConfigData(requestData: RequestInstallData): Promise<DeployConfigData> {
    try {
      const url = KYMA_SERVICE_CLASS_GATEWAY_URL + `/api/extension-catalog/v1/extension-deployments/${requestData.extensionDeploymentId}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': requestData.accountId,
          'X-Company-Id': requestData.companyId
        },
        params: {
          expand: 'latestSuccessfulDeployResult'
        }
      } as AxiosRequestConfig;

      const retValue = await this.httpService.get(url, config).toPromise();
      const deploymentObj = retValue.data;

      this.loggerService.log('DeploymentConfigData:', null, requestData);
      this.loggerService.log(deploymentObj, null, requestData);
      return {
        // namespace is set to the INSTALLER_NAMESPACE if nothing provided in deploymentConfig
        namespace: (deploymentObj.deploymentConfig && deploymentObj.deploymentConfig.namespace) ? deploymentObj.deploymentConfig.namespace : INSTALLER_NAMESPACE,
        parameterValues: deploymentObj.deploymentConfig ? deploymentObj.deploymentConfig.values : null,
        appVersion: deploymentObj.extension.version,
        chartConfigData: {
          repository: deploymentObj.extension.artifactConfig.chart.repository,
          ref: deploymentObj.extension.artifactConfig.chart.ref,
          path: deploymentObj.extension.artifactConfig.chart.path
        } as ChartConfigData,
        lastHelmContent: {
          helmRelease: (deploymentObj.latestSuccessfulDeployResult && deploymentObj.latestSuccessfulDeployResult.content)
            ? deploymentObj.latestSuccessfulDeployResult.content.helmRelease : null,
          namespace: (deploymentObj.latestSuccessfulDeployResult && deploymentObj.latestSuccessfulDeployResult.content)
            ? deploymentObj.latestSuccessfulDeployResult.content.namespace : null
        }
      } as DeployConfigData;
    } catch (error) {
      this.loggerService.error(error.toString(), null, null, requestData);
      throw error;
    }
  }

  public async updateDeploymentInfoToCatalog(updatedDeployData: UpdatedDeployData) {
    try {
      const url = KYMA_SERVICE_CLASS_GATEWAY_URL +
        '/api/extension-catalog/v1/extension-deployments/' + updatedDeployData.extensionDeploymentId;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': updatedDeployData.accountId,
          'X-Company-Id': updatedDeployData.companyId
        }
      } as AxiosRequestConfig;
      const data = {
        version: updatedDeployData.version,
        state: updatedDeployData.state,
        accessUrl: updatedDeployData.accessUrl
      };
      if (!data.version) {
        delete data.version;
      }

      await this.httpService.patch(url, data, config).toPromise();
    } catch (error) {
      this.loggerService.error(error.toString(), null, null, updatedDeployData);
      throw error;
    }
  }

  public async addDeploymentResultToCatalog(deployResultData: DeployResultData) {
    try {
      const url = KYMA_SERVICE_CLASS_GATEWAY_URL +
        `/api/extension-catalog/v1/extension-deployments/${deployResultData.extensionDeploymentId}/deployment-results`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': deployResultData.accountId,
          'X-Company-Id': deployResultData.companyId
        }
      } as AxiosRequestConfig;
      const data = {
        log: deployResultData.log,
        shortMessage: deployResultData.shortMessage,
        content: null
      };
      if (deployResultData.content) {
        data.content = {
          helmRelease: deployResultData.content.helmRelease,
          namespace: deployResultData.content.namespace
        }
      } else {
        delete data.content;
      }

      await this.httpService.post(url, data, config).toPromise();
    } catch (error) {
      this.loggerService.error(error.toString(), null, null, deployResultData);
      throw error;
    }
  }

  public async sendLogsToExtensionCatalog(message: string, logType: LoggingTypes, requestData: RequestData) {
    try {
      const url = KYMA_SERVICE_CLASS_GATEWAY_URL + '/api/extension-catalog/v1/extension-installers/log';

      // TODO: get request context for header information
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Account-Id': requestData.accountId,
          'X-Company-Id': requestData.companyId
        }
      } as AxiosRequestConfig;

      const data = {
        logMessage: message,
        logType: logType
      }

      console.log(`
      
      ===============
      
      ${JSON.stringify(config)}
      
      ${JSON.stringify(data)}
      
      ${JSON.stringify(url)}
      
      ===============
      
      `);

      // await this.httpService.post(url, data, config).toPromise();
    } catch (error) {
      // TODO: This will cause an infinite loop, so no logging possible like this
      // this.loggerService.error(error.toString());
      throw error;
    }
  }

}
