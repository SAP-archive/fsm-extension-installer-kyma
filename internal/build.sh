#!/bin/bash
set -e 
. ../VERSIONINFO

echo "Start to build the extension installler"

echo "======nodejs build=================================="
cd ../backend
npm run build:prod
cd ..

echo "======docker build=================================="
docker build -t sapfsm/fsm-extension-installer-for-kyma:$appVersion .

echo "======docker push=================================="
docker push sapfsm/fsm-extension-installer-for-kyma:$appVersion

echo "Extension installer is built successfully!"
