import { Injectable } from '@nestjs/common';
import { KUBE_CONFIG_LOCATION, KUBECTL_BINARY_LOCATION } from '../utils/constants';

import { CmdhelperService } from '../cmdhelper/cmdhelper.service';
import { ExtensionInstallerLoggerService } from 'src/utils/logger/extension-installer-logger.service';

@Injectable()
export class KubectlService {

    constructor(private readonly cmdhelperService: CmdhelperService,
                private readonly loggerService: ExtensionInstallerLoggerService) {
        this.loggerService.setContext(KubectlService.name);
    }

    public async getAccessUrlFromKymaByAppName(appName: string, namespace: string): Promise<string> {
        let cmdValue = this.buildKubectlCmd4Get('virtualservices', appName, namespace);
        let result = await this.execKubectlCmd(cmdValue);

        let accessUrl = '';
        if (result.stdout) {
            const jsonResult = JSON.parse(result.stdout);
            accessUrl = 'https://' + jsonResult.spec.hosts[0];
        } else if (result.stderr) {
            this.loggerService.warn(result.stderr);
            // fallback to use label selector 
            // From Kyma 1.12.0, the APIRule is the only way to expose API
            // And the name of VirtualService which is owned with the APIRule, has postfix, so we can't simply get it by name
            cmdValue = this.buildKubectlCmd4GetByLabel('virtualservices',
                namespace,
                'apirule.gateway.kyma-project.io/v1alpha1',
                `${appName}.${namespace}`);
            result = await this.execKubectlCmd(cmdValue);
            if (result.stdout) {
                const jsonResult = JSON.parse(result.stdout);
                accessUrl = 'https://' + jsonResult.items[0].spec.hosts[0];
            } else if (result.stderr) {
                this.loggerService.error(result.stderr);
                throw new Error("Can't find the relevant VirtualService");
            }
        }

        return accessUrl;
    }

    private buildKubectlCmd4GetByLabel(kindType: string, namespace: string, labelKey: string, labelValue?: string): string[] {
        this.validateNotEmpty(kindType, 'kindType');
        this.validateNotEmpty(labelKey, 'labelKey');
        this.validateNotEmpty(namespace, 'namespace');

        let cmdValue = '';
        if (labelValue) {
            cmdValue = `get ${kindType} -l ${labelKey}=${labelValue} -n ${namespace} --kubeconfig=${KUBE_CONFIG_LOCATION} --output=json`;
        } else {
            cmdValue = `get ${kindType} -L ${labelKey} -n ${namespace} --kubeconfig=${KUBE_CONFIG_LOCATION} --output=json`
        }

        return cmdValue.split(/(\s+)/).filter(e => e.trim().length > 0);
    }

    private buildKubectlCmd4Get(kindType: string, value: string, namespace: string): string[] {
        this.validateNotEmpty(kindType, 'kindType');
        this.validateNotEmpty(value, 'kindValue');
        this.validateNotEmpty(namespace, 'namespace');

        const getCmdValue = `get ${kindType} ${value} -n ${namespace} --kubeconfig=${KUBE_CONFIG_LOCATION} --output=json`;

        return getCmdValue.split(/(\s+)/).filter( e => e.trim().length > 0);
    }

    private async execKubectlCmd(cmdValue: string[]) {
        //Perform kubectl command
        const result = {stdout: null, stderr: null};
        try {
            const response = await this.cmdhelperService.runCmd(`${KUBECTL_BINARY_LOCATION}`, cmdValue)
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
}
