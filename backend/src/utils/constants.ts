//Define saved helm-chart files path after downloading it from github.
export const CHART_CACHE_PATH: string = (process.env.SHARE_DIR? process.env.SHARE_DIR: process.cwd()) +'/chart_caches/';

//Define path of helm-cli(must be v3!!!) and kubectl-cli, default initialized via ENV command in Dockerfile file.
export const HELM_BINARY_LOCATION: string = process.env.HELM_BINARY || '/usr/local/bin/helm3';
export const KUBECTL_BINARY_LOCATION: string = process.env.KUBECTL_BINARY || '/usr/local/bin/kubectl';

//Using binding serviceclass instance on Kyma cluster to get this value
export const KYMA_SERVICE_CLASS_GATEWAY_URL: string = process.env.GATEWAY_URL || 'https://et.coresystems.net/cloud-extension-catalog-service';

//Define path of kubeconfig, default initialized via ENV command in Dockerfile
export const KUBE_CONFIG_LOCATION: string = process.env.KUBECONFIG_PATH || '~/.kube/config';

//Define the version of Kyma which the installer is setup on
export const KYMA_VER: string = process.env.KYMA_VER;
