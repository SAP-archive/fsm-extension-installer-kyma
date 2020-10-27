import { Injectable } from '@nestjs/common';
import { HelmBaseOptions, HelmDeployOptions } from '../utils/interfaces/helmperformoptions.interface';
import { HELM_BINARY_LOCATION, KUBE_CONFIG_LOCATION, KYMA_VER } from '../utils/constants';
import { CmdhelperService } from '../cmdhelper/cmdhelper.service';
import { ExtensionInstallerLoggerService } from '../utils/logger/extension-installer-logger.service';
import { RequestData } from '../utils/interfaces/requestdata.interface';

@Injectable()
export class HelmserviceService {

    constructor(private readonly cmdhelperService: CmdhelperService,
                private readonly loggerService: ExtensionInstallerLoggerService) {
        this.loggerService.setContext(HelmserviceService.name);
    }

    public async install(helmDeployOptions: HelmDeployOptions, requestData: RequestData) {
        //Build helm command
        const cmdValue = this.buildHelmCmd4Install(helmDeployOptions, requestData);

        //Perform helm command
        return await this.execHelmCmd(cmdValue, requestData);
    }

    public async delete(helmDeleteOptions: HelmBaseOptions, requestData: RequestData) {
        //Build helm command
        const cmdValue = this.buildHelmCmd4Delete(helmDeleteOptions, requestData);

        //Perform helm command
        return await this.execHelmCmd(cmdValue, requestData);
    }

    public async exist(helmStatusOptions: HelmBaseOptions, requestData: RequestData) {
        let isExist = false;
        const cmdValue = this.buildHelmCmd4Status(helmStatusOptions, requestData);

        const result = await this.execHelmCmd(cmdValue, requestData);
        if (result.stdout) {
            isExist = true;
        }

        return isExist;
    }

    private buildHelmCmd4Install(helmDeployOptions: HelmDeployOptions, requestData: RequestData): string[] {
        this.validateNotEmpty(helmDeployOptions.releaseName, 'releaseName', requestData);
        this.validateNotEmpty(helmDeployOptions.namespace, 'namespace', requestData);

        //Add --set value
        //kyma.apiv1 is kept in order to support the extension app generated from old scaffold
        let installCommand = `install --set kyma.apiv1.enabled=true --set kyma.api.enabled=true `;
        installCommand += this.getConfigValues(helmDeployOptions.values);

        //Add --atomic, --timeout --output
        installCommand += ' --atomic';
        installCommand += ' --timeout 5m0s';
        installCommand += ' --output json ';

        //Add kyma version
        if (KYMA_VER) {
            installCommand += ` --set kyma.version=${KYMA_VER} `;
        }

        //Add release name
        const releaseName = helmDeployOptions.releaseName.toLowerCase();
        installCommand += releaseName;

        //Add chart location
        installCommand += ' ';
        installCommand += helmDeployOptions.chartLocation;

        //Add namespace
        installCommand += ` -n ${helmDeployOptions.namespace}`;

        //Set path to the kubeconfig file, default is '~/.kube/'
        installCommand += ` --kubeconfig ${KUBE_CONFIG_LOCATION}`;

        return installCommand.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    private buildHelmCmd4Delete(helmDeleteOptions: HelmBaseOptions, requestData: RequestData): string[] {
        this.validateNotEmpty(helmDeleteOptions.releaseName, 'releaseName', requestData);
        this.validateNotEmpty(helmDeleteOptions.namespace, 'namespace', requestData);

        let uninstallCommand = `uninstall --timeout 5m0s `;

        //Add namespace
        uninstallCommand += `-n ${helmDeleteOptions.namespace} `;

        //Set path to the kubeconfig file, default is '~/.kube/'
        uninstallCommand += ` --kubeconfig ${KUBE_CONFIG_LOCATION} `;

        //Add release name
        uninstallCommand += `${helmDeleteOptions.releaseName}`;

        return uninstallCommand.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    private buildHelmCmd4Status(helmStatusOptions: HelmBaseOptions, requestData: RequestData): string[] {
        this.validateNotEmpty(helmStatusOptions.releaseName, 'releaseName', requestData);
        this.validateNotEmpty(helmStatusOptions.namespace, 'namespace', requestData);

        let statusCommand = `status ${helmStatusOptions.releaseName}`;

        //Add namespace
        statusCommand += ` -n ${helmStatusOptions.namespace}`;

        //Set path to the kubeconfig file, default is '~/.kube/'
        statusCommand += ` --kubeconfig ${KUBE_CONFIG_LOCATION}`;

        //Add release name
        statusCommand += ` --output json`;

        return statusCommand.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    private async execHelmCmd(cmdValue: string[], requestData: RequestData) {
        //Perform helm install command
        const result = {stdout: null, stderr: null};
        try {
            const response = await this.cmdhelperService.runCmd(`${HELM_BINARY_LOCATION}`, cmdValue)
            result.stdout = response;
            this.loggerService.log(response, null, requestData);
        } catch (error) {
            result.stderr = error;
            this.loggerService.error(error, null, null, requestData);
        } finally {
            return result;
        }
    }

    private validateNotEmpty(arg, argName, requestData) {
        if (typeof arg === 'undefined' || arg === null || arg === '') {
            const errorMsg = `${argName} is required`;
            this.loggerService.error(errorMsg, null, null, requestData);
            throw new Error(errorMsg);
        }
    }

    private getConfigValues(values) {
        if (!values) {
            return '';
        }

        //Extract and build set parameters
        //Assumption: the values is JSON object
        let configStr = '';
        for (const attribute in values) {
            if (values.hasOwnProperty(attribute)) {
                configStr += ` --set ${attribute}=${values[attribute]}`;
            }
        }

        return configStr;
    }
}
