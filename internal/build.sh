#!/bin/bash
set -e 
. ../VERSIONINFO

echo "Start to build the extension installler"

echo "======nodejs build=================================="
cd ../backend
npm run build:prod
cd ..

echo "======docker build=================================="
docker build -t i503740/fsm-extension-installer-for-kyma:$appVersion .

echo "======docker push=================================="
docker push i503740/fsm-extension-installer-for-kyma:$appVersion

echo "Extension installer is built successfully!"
