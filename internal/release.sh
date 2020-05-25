#!/bin/bash
. ../VERSIONINFO

shopt -s expand_aliases
if [[ "$OSTYPE" == "darwin"* ]]; then
  alias sed='sed -i ""'
else
  alias sed='sed -i""'
fi

echo "Start to create a new version of extension installer addon"

if [ ! -d "../addons/fsm-extension-installer-${version}" ]; then
  echo "======create addon folder structure================"
  mkdir ../addons/fsm-extension-installer-${version}
  cp -r ../addons/scaffolds/* ../addons/fsm-extension-installer-${version}
  mkdir ../addons/fsm-extension-installer-${version}/chart
  mkdir ../addons/fsm-extension-installer-${version}/chart/fsm-extension-installer
  cp -r ../helm/fsm-extension-installer/* ../addons/fsm-extension-installer-${version}/chart/fsm-extension-installer
fi

echo "======replace with new versions===================="
cd ../addons/fsm-extension-installer-${version}
for i in `find ./ -type f`
do
  sed "s/\${appVersion}/${appVersion}/g" $i
  sed "s/\${version}/${version}/g" $i
done
echo "======replace with new uuid========================"
# For Linux, it is easily to generate uuid by `cat /proc/sys/kernel/random/uuid`, however, Windows is not so easy
# So we have to use web api
uuid=$(curl -s https://www.uuidgenerator.net/api/version4/)
sed "s/\${uuid}/${uuid}/g" $i ./plans/default/meta.yaml
uuid=$(curl -s https://www.uuidgenerator.net/api/version4/)
sed "s/\${uuid}/${uuid}/g" $i ./meta.yaml
cd ../../internal

echo "======update index.yaml to reflect latest version=="
sed 's/version:.*/version: '${version}'/g' ../addons/index.yaml

echo "The new version of extension installer is generated, please check in the git repository!"