//Include: Install and Upgrade
export interface HelmDeployOptions {
    releaseName: string,
    namespace: string,
    chartLocation: string,
    values: string
};

export interface HelmDeleteOptions {
    releaseName: string,
    namespace: string
};
