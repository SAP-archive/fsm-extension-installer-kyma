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

# Limitations
1. Private docker registry is not be supported in the Helm Charts.
2. Private github repository is not be supported for Extension Application.

# Known Issues
There are no known issues for the moment.

# How to obtain support
In case you find a bug or need support, please open an issue [here](https://github.com/SAP-samples/fsm-extension-installer-kyma/issues/new).

# License
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](./LICENSE) file.
