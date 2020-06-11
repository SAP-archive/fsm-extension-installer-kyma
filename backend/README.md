# Local Development

## Preparation

- Install Node.js runtime via https://nodejs.org/en/download/
- Install nestjs CLI via https://docs.nestjs.com/cli/overview
- Install Kubectl CLI via https://kubernetes.io/docs/tasks/tools/install-kubectl/
- Get the kubeconfig file and configure the CLI https://kyma-project.io/docs/components/security/#details-iam-kubeconfig-service-get-the-kubeconfig-file-and-configure-the-cli
- Install Helm3 CLI via https://helm.sh/docs/intro/install/

## Update stub

Open the [constants.ts](src/utils/constants.ts), update these constants as your need, like updating the `HELM_BINARY_LOCATION` to the Helm3 CLI location of your local computer, `KYMA_VER` to your Kyma cluster version, etc.

## Running the app

```bash
$ npm install && npm run build

$ npm run start

# Check if it is started successfully
$ curl http://127.0.0.1:8000/api/fsm-extension-installer/v1/status
```

All API are under the path "/api/fsm-extension-installer/v1", you can use any HTTP client (curl, postman, etc) to invoke it just like how Kyma eventing service does.

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Release

Please refer [release-guide.md](../internal/release-guide.md) for manual release process before the pipeline is setup.