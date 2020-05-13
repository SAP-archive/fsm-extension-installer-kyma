import {Injectable, Logger, LoggerService} from '@nestjs/common';
import util = require('util');

import {HelmDeleteOptions, HelmDeployOptions} from '../utils/interfaces/helmperformoptions.interface';
import {HELM_BINARY_LOCATION, KUBE_CONFIG_LOCATION} from '../utils/constants';

const exec = util.promisify(require('child_process').exec);

@Injectable()
export class HelmserviceService {
    private readonly loggerService: LoggerService = new Logger(HelmserviceService.name, true);

    public async install(helmDeployOptions: HelmDeployOptions) {
        //Build helm command
        const cmdValue = this.buildHelmCmd4Install(helmDeployOptions);

        //Perform helm command
        return await this.execHelmCmd(cmdValue);
    }

    public async delete(helmDeleteOptions: HelmDeleteOptions) {
        //Build helm command
        const cmdValue = this.buildHelmCmd4Delete(helmDeleteOptions);

        //Perform helm command
        return await this.execHelmCmd(cmdValue);
    }

    private buildHelmCmd4Install(helmDeployOptions: HelmDeployOptions): string {
        this.validateNotEmpty(helmDeployOptions.releaseName, 'releaseName');
        this.validateNotEmpty(helmDeployOptions.namespace, 'namespace');

        //Add --set value
        let installCommand = `install --set kyma.apiv1.enabled=true `
        installCommand += this.getConfigValues(helmDeployOptions.values);

        //Add --atomic, --timeout --output
        installCommand += ' --atomic';
        installCommand += ' --timeout 5m0s';
        installCommand += ' --output json ';

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

        return installCommand;
    }

    private buildHelmCmd4Delete(helmDeleteOptions: HelmDeleteOptions): string {
        this.validateNotEmpty(helmDeleteOptions.releaseName, 'releaseName');
        this.validateNotEmpty(helmDeleteOptions.namespace, 'namespace');

        let uninstallCommand = `uninstall --timeout 5m0s `;

        //Add namespace
        uninstallCommand += `-n ${helmDeleteOptions.namespace} `;

        //Set path to the kubeconfig file, default is '~/.kube/'
        uninstallCommand += ` --kubeconfig ${KUBE_CONFIG_LOCATION} `;

        //Add release name
        uninstallCommand += `${helmDeleteOptions.releaseName}`;

        return uninstallCommand;
    }

    private async execHelmCmd(cmdValue: string) {
        //Perform helm install command
        const result = {stdout: null, stderr: null};
        try {
            const response = await exec(`${HELM_BINARY_LOCATION} ${cmdValue}`);
            result.stderr = response.stderr;
            result.stdout = response.stdout;
            this.loggerService.log(response.stdout.toString());
        } catch (error) {
            result.stderr = error.stderr;
            result.stdout = error.stdout;
            this.loggerService.error(error.stderr.toString());
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
