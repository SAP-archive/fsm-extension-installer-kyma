# Requirements
Make sure the following prerequisites are ready before you use this repository for your extension application:
* Install Git CLI locally via https://git-scm.com/downloads
* Install Docker Desktop locally via https://www.docker.com/get-started, and sign in the docker registry from Docker Desktop GUI or Docker Desktop CLI
* Make sure your Docker ID has been added into the DockerHub orignzation https://hub.docker.com/orgs/sapfsm
* Install Node.js runtime on your local computer via https://nodejs.org/en/download/
* Install nestjs CLI on your local computer via https://docs.nestjs.com/cli/overview

# Release process

**DON'T Manually change any files under the folder /addons!**

## Maintain the file VERSIONINFO under root folder manually
* If you make change in the nodejs code within the folder /backend, then you shall update both the fields "appVersion" and "version"; If you only make change in the helm charts within the folder /helm, then you shall only update the field "version". 

## Build docker image
* Go to the folder /internal and Run the command `sh ./build.sh`

## Release new version
* Go to the folder /internal and Run the command `sh ./release.sh`

## Check in and push the git registry
