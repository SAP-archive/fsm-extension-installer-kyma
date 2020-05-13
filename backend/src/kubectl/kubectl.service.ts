import {Injectable, Logger, LoggerService} from '@nestjs/common';
import util = require('util');
import {KUBECTL_BINARY_LOCATION, KUBE_CONFIG_LOCATION} from '../utils/constants';

const exec = util.promisify(require('child_process').exec);

@Injectable()
export class KubectlService {
    private readonly loggerService: LoggerService = new Logger(KubectlService.name, true);

    public async getAccessUrlFromKymaByAppName(appName: string, namespace: string): Promise<string> {
        const cmdValue = this.buildKubectlCmd4Get('virtualservices', appName, namespace);
        const result = await this.execKubectlCmd(cmdValue);

        let accessUrl = '';
        if (result.stdout) {
            const jsonResult = JSON.parse(result.stdout);
            accessUrl = 'https://' + jsonResult.spec.hosts[0];
        }

        return accessUrl;
    }

    private buildKubectlCmd4Get(kindType: string, value: string, namespace: string): string {
        this.validateNotEmpty(kindType, 'kindType');
        this.validateNotEmpty(value, 'kindValue');
        this.validateNotEmpty(namespace, 'namespace');

        const getCmdValue = `get ${kindType} ${value} -n ${namespace} --kubeconfig=${KUBE_CONFIG_LOCATION} --output=json`;

        return getCmdValue;
    }

    private async execKubectlCmd(cmdValue: string) {
        //Perform helm install command
        const result = {stdout: null, stderr: null};
        try {
            const response = await exec(`${KUBECTL_BINARY_LOCATION} ${cmdValue}`);
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
}
