import {ChartConfigData} from "./chartconfigdata.interface";

export interface DeployConfigData {
    chartConfigData: ChartConfigData, // Artifact configuration data for helm chart
    namespace: string, // Namespace for will be deployed location
    parameterValues: string, // JSON object for deployed parameter values via helm chart
    appVersion: string,
    lastHelmContent: {
        helmRelease: string,
        namespace: string
    }
}
