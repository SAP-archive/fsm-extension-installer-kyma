# fsm-extension-installer-kyma
Use this sample to deploy, build, and refine the integration between an SAP FSM extension application and a Kyma system. It can be cloned and enhanced with logic to meet specific business needs.

# Description
The Customers can use this sample to quickly deploy the SAP FSM extension application on Kyma system, It can accelerate the building and refinement of the integration between the SAP FSM system and Kyma system. The Customers can clone it and enhance it with their own logic to meet their own specific needs if they want. Thus enabling this integration to be continuously improved with the use of customers.

# Requirements
Make sure the following prerequisites are ready before you use this repository for your extension application:
* Install Git CLI locally via https://git-scm.com/downloads
* Have an account in public docker registry, such as Docker Hub
* Install Docker Desktop locally via https://www.docker.com/get-started, and sign in the docker registry from Docker Desktop GUI or Docker Desktop CLI
* Install helm CLI locally and configure it via https://kyma-project.io/docs/#installation-use-helm
* Install Node.js runtime on your local computer via https://nodejs.org/en/download/

# How to build docker image
* Ensure that the docker server is running on your local computer;
* Enter to 'backend' folder and run below command:
  1. `npm run build:prod`
  2. Note: Please firstly delete node_modules folder if you find have node_modules folder on this current path.
* Back to root path, you can find 'Dockerfile' file, then run below command to build docker image:
  `docker build -t ${docker_registry}/${application_name}:${application_version} .`
* Run below command to view new docker image:
  `docker images | grep '${application_name}'`

# How to set up extension installer
## Prerequisites
In order to install extension installer in Kyma, you must fulfill the following requirements:

1. You must have [k8s CLI](https://kubernetes.io/docs/tasks/tools/install-kubectl) installed.
2. You must have [Helm 2 CLI](https://v2.helm.sh/docs/using_helm/#installing-helm) installed.
3. You must have set up Kyma connection with FSM and created an **Application** in Kyma by following the [guide](https://docs.coresystems.net/extensions-ui-plugins/cloud-platform-extension-factory-integration.html).

## Installation Process
1. Open the Kyma console and create a **Namespace** where you want to deploy the extension installer.
2. Create bindings for **Application** that you have created in Kyma.

    a. Navigate to the application and click **+ Create Bindings**.

    b. Select the namespace that you created in step 1 and disable **Select all** of Services & Events.

    c. Select **Extension Catalog API**. Then save it.
3. Create service instance for **Application** that you have created in Kyma.
    
    a. Navigate to the namespace that you created in step 1.

    b. Select **Catalog** in left navigation sidebar. Then switch to **Services** and navigate to the service that corresponds to the **Application** that you have created in Kyma.

    c. Click **Add once** to provision a service instance. Enter a service instance name and save it. And you can see your instance in Kyma console under **Instance**.
4. Download the config for Kyma cluster from General Settings page of Kyma console. 

    *Note*: **Your kube config expires every 8 hours!**

 5. Access Kyma connector using Kubectl with command:
 
    `kubectl --kubeconfig /custom/path/kubeconfig.yml`
     
    If you prefer to have only one config file for all your k8s context, you could refer this [documentation](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).

6. Configure helm in order to manage resource in Kyma. See the [reference](https://kyma-project.io/docs/#installation-use-helm).

7. Deploy extension installer.

    Change the current directory into downloaded extension installer directory. Execute the command:
    `helm install ./fsm-extension-installer-kyma/helm --name=<extension_installer_name> --set appName=<application_name> --set serviceInstanceName=<service_instance_name> --set kyma.verison=<kyma_version> --namespace=<kyma_namespace> --tls`
    
    And replace the variables as follows:

    `<extension_installer_name>`: your extension installer name

    `<application_name>`: the one you created in step 3 of Prerequisites section

    `<service_instance_name>`: the service instance name you entered in step 3.c

    `<kyma_version>`: the version of Kyma

    `<kyma_namespace>`: the one you created step 1


# Limitations
1. Private docker registry is not be supported in the Helm Charts.
2. Private github repository is not be supported for Extension Application.

# Known Issues
There are no known issues for the moment.

# How to obtain support
In case you find a bug or need support, please open an issue [here](https://github.com/SAP-samples/fsm-extension-installer-kyma/issues/new).

# License
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](./LICENSE) file.
