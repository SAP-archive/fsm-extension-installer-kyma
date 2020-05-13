import {RequestData} from './requestdata.interface';

export interface DeployResultData extends RequestData{
    extensionDeploymentId: string,
    log: string,
    shortMessage: string,
    content: {
        helmRelease: string,
        namespace: string
    }
}
