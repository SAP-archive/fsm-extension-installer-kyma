# Requirements
Make sure the following prerequisites are ready before you use this repository for your extension application:
* Install Git CLI locally via https://git-scm.com/downloads
* Install Docker Desktop locally via https://www.docker.com/get-started, and sign in the docker registry from Docker Desktop GUI or Docker Desktop CLI
* Make sure your Docker ID has been added into the DockerHub orignzation https://hub.docker.com/orgs/sapfsm
* Install Node.js runtime on your local computer via https://nodejs.org/en/download/

# How to build docker image
* Ensure that the docker demeon is running on your local computer
* Enter to 'backend' folder and run below command:
  1. `npm run build:prod`
  2. Note: Please firstly delete node_modules folder if you find have node_modules folder on this current path.
* Back to root path, you can find 'Dockerfile' file, then run below command to build docker image:
  `docker build -t ${docker_registry}/${application_name}:${application_version} .`
* Run below command to view new docker image:
  `docker images | grep '${application_name}'`
* Push the new docker image to Docker Hub:
  `docker push ${docker_registry}/${application_name}:${application_version}`

# How to release new version
* Update the field "image.tag" in [values.yaml](../helm/fsm-extension-installer/values.yaml)
* Update the fields "appVersion" and "version" in [Chart.yaml](../helm/fsm-extension-installer/Chart.yaml). If you only change the helm chart, then only the field "version" shall be updated
* Create new folder under addons. The folder name shall be "fsm-extension-installer-${version}", And then create child folder chart/fsm-extension-installer. Copy all files under [helm/fsm-extension-installer](../helm/fsm-extension-installer) into it
* Create new folder plans/default under the folder "fsm-extension-installer-${version}", create files meta.yaml and create-instance-schema.json following https://kyma-project.io/docs/components/helm-broker/#details-create-addons-plans-directory 
* Create new file meta.yaml under the folder "fsm-extension-installer-${version}" following https://kyma-project.io/docs/components/helm-broker/#details-create-addons-meta-yaml-file
* Update the field "version" in [index.yaml](../addons/index.yaml)
* Push the Git repository