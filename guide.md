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