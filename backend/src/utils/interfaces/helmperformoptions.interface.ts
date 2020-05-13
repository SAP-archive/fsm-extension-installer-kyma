//Include: Install and Upgrade
export interface HelmBaseOptions {
    releaseName: string,
    namespace: string
}

export interface HelmDeployOptions extends HelmBaseOptions{
    chartLocation: string,
    values: string
};
