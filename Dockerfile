#Prepare node.js basic run environment
FROM node:10-alpine3.11

ARG HELM_VERSION="v3.2.0"
ARG KUBE_LATEST_VERSION="v1.18.0"

#Add ENVs
ENV HELM_BINARY="/usr/local/bin/helm" \
    KUBECTL_BINARY="/usr/local/bin/kubectl" \
    KUBECONFIG_PATH="/share/kubeconfig"

#Install necessary tools, include: git, kubectl and helm-ctl
RUN apk add --no-cache git bash \
    && wget -q https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz -O - | tar -xzO linux-amd64/helm > /usr/local/bin/helm \
    && chown node ${HELM_BINARY} && chmod u+x ${HELM_BINARY}  \
    && wget -q https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -O /usr/local/bin/kubectl \
    && chown node ${KUBECTL_BINARY} && chmod u+x ${KUBECTL_BINARY} 

#Create app directory and set to current
WORKDIR /usr/src/fsm-extension-installer-for-kyma

#Copy source code and dependency packages
COPY ./backend/release ./backend
COPY ./backend/node_modules ./node_modules

EXPOSE 8000

#Run as predefined non-root user, see https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user 
USER node

#Run current application
CMD ["node", "./backend/main.js"]
