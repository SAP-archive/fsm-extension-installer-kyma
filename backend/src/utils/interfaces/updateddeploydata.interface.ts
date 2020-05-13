import {RequestData} from './requestdata.interface';

export interface UpdatedDeployData extends RequestData{
    extensionDeploymentId: string,
    state: string, // State is result of deploy extension app
    version: string, // Extension app version
    accessUrl: string // Url for deployed extension app in Kyma cluster
}
