//Define saved helm-chart files path after download it from github.
export const CHAR_CACHE_PATH: string = process.cwd() + '/chart_caches/';

//Define path of helm-cli and kubectl-cli, default need to initialization via ENN command in Dockerfile file.
export const HELM_BINARY_LOCATION: string = process.env.HELM_BINARY || '/usr/local/bin/helm3';
export const KUBECTL_BINARY_LOCATION: string = process.env.KUBECTL_BINARY || '/usr/local/bin/kubectl';

//Using binding serviceclass instance on Kyma cluster to get this value
export const KYMA_SERVICE_CLASS_GATEWAY_URL: string = process.env.GATEWAY_URL || 'https://et.coresystems.net/cloud-extension-catalog-service';

//Ensure to initialize this value('/share') via ENV command in Dockerfile
export const KUBE_CONFIG_LOCATION: string = process.env.KUBECONFIG_PATH || '/Users/i076717/.kube/config';
