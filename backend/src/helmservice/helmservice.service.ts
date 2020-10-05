import { Injectable, LoggerService } from '@nestjs/common';

import { HelmBaseOptions, HelmDeployOptions } from '../utils/interfaces/helmperformoptions.interface';
import { HELM_BINARY_LOCATION, KUBE_CONFIG_LOCATION, KYMA_VER } from '../utils/constants';
import { CmdhelperService } from './../cmdhelper/cmdhelper.service';
import { ExtensionInstallerLogger } from 'src/utils/logger/extension-installer-logger';

@Injectable()
export class HelmserviceService {
    private readonly loggerService: LoggerService = new ExtensionInstallerLogger(HelmserviceService.name, true);

    constructor(private readonly cmdhelperService: CmdhelperService) {
    }

    public async install(helmDeployOptions: HelmDeployOptions) {
        //Build helm command
        const cmdValue = this.buildHelmCmd4Install(helmDeployOptions);

        //Perform helm command
        return await this.execHelmCmd(cmdValue);
    }

    public async delete(helmDeleteOptions: HelmBaseOptions) {
        //Build helm command
        const cmdValue = this.buildHelmCmd4Delete(helmDeleteOptions);

        //Perform helm command
        return await this.execHelmCmd(cmdValue);
    }

    public async exist(helmStatusOptions: HelmBaseOptions) {
        let isExist = false;
        const cmdValue = this.buildHelmCmd4Status(helmStatusOptions);

        const result = await this.execHelmCmd(cmdValue);
        if (result.stdout) {
            isExist = true;
        }

        return isExist;
    }

    private buildHelmCmd4Install(helmDeployOptions: HelmDeployOptions): string[] {
        this.validateNotEmpty(helmDeployOptions.releaseName, 'releaseName');
        this.validateNotEmpty(helmDeployOptions.namespace, 'namespace');

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

    private buildHelmCmd4Delete(helmDeleteOptions: HelmBaseOptions): string[] {
        this.validateNotEmpty(helmDeleteOptions.releaseName, 'releaseName');
        this.validateNotEmpty(helmDeleteOptions.namespace, 'namespace');

        let uninstallCommand = `uninstall --timeout 5m0s `;

        //Add namespace
        uninstallCommand += `-n ${helmDeleteOptions.namespace} `;

        //Set path to the kubeconfig file, default is '~/.kube/'
        uninstallCommand += ` --kubeconfig ${KUBE_CONFIG_LOCATION} `;

        //Add release name
        uninstallCommand += `${helmDeleteOptions.releaseName}`;

        return uninstallCommand.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    private buildHelmCmd4Status(helmStatusOptions: HelmBaseOptions): string[] {
        this.validateNotEmpty(helmStatusOptions.releaseName, 'releaseName');
        this.validateNotEmpty(helmStatusOptions.namespace, 'namespace');

        let statusCommand = `status ${helmStatusOptions.releaseName}`;

        //Add namespace
        statusCommand += ` -n ${helmStatusOptions.namespace}`;

        //Set path to the kubeconfig file, default is '~/.kube/'
        statusCommand += ` --kubeconfig ${KUBE_CONFIG_LOCATION}`;

        //Add release name
        statusCommand += ` --output json`;

        return statusCommand.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    private async execHelmCmd(cmdValue: string[]) {
        //Perform helm install command
        const result = {stdout: null, stderr: null};
        try {
            const response = await this.cmdhelperService.runCmd(`${HELM_BINARY_LOCATION}`, cmdValue)
            result.stdout = response;
            this.loggerService.log(response);
        } catch (error) {
            result.stderr = error;
            this.loggerService.error(error);
        } finally {
            return result;
        }
    }

    private validateNotEmpty(arg, argName) {
        if (typeof arg === 'undefined' || arg === null || arg === '') {
            const errorMsg = `${argName} is required`;
            this.loggerService.error(errorMsg);
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
