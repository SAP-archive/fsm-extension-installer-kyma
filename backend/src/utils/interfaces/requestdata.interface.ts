export interface RequestData {
     accountId: string,
     companyId: string
}

export interface RequestInstallData extends RequestData{
     extensionDeploymentId: string
}

export interface RequestUninstallData extends RequestData{
     releaseName: string,
     namespace: string
}
