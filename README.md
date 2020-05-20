# fsm-extension-installer-kyma

Customers can use this sample to quickly deploy the SAP FSM extension application on Kyma system. It can accelerate the building and refinement of the integration between the SAP FSM system and Kyma system. Customers can clone and enhance it with their own logic to meet their own specific needs, which enables the integration to be continuously improved with the use of customers.

# How to set up extension installer

## Prerequisites

In order to install extension installer in Kyma, you must fulfill the following requirements:

1. You must have set up Kyma connection with FSM and created an **Application** in Kyma by following the [guide](https://docs.coresystems.net/extensions-ui-plugins/cloud-platform-extension-factory-integration.html).

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

4. Register extension installer addon.

   a. Select **Addons** in left navigation sidebar.

   b. Click **Add New Configuration** and fill out the following data. Then click **Add** and you can see this new addon is displayed with "Ready" status.

      - Enter an addon name.
      - Enter `github.com/SAP-samples/fsm-extension-installer-kyma/addons/index.yaml` as Urls.

5. Provisioning extension installer addon instance.

   a. Select **Catalog** in left navigation sidebar. Then switch to **Add-Ons** and navigate to the addon that you registered in step 4.

   b. Click **Add** to provision an addon instance and fill out the following data. Then click **Create** and you can see this new addon instance is displayed with "PROVISIONING" status and it changes to "RUNNING" status finally.

      - Enter an addon instance name.
      - Choose Default plan.
      - Enter application name that you created in section Prerequisites.
      - Enter service instance name that you created in step 3.
      - Enter the exact Kyma version.

6. [Optional] Install the latest version of extension installer as needed by following these steps:

   a. Delete the extension installer addon instance that was provisioned in step 5.

   b. Delete the extension installer addon that was registered in step 4.

   c. Redo step 4 and step 5.

# Known Issues

There are no known issues for the moment.

# How to obtain support

In case you find a bug or need support, please open an issue [here](https://github.com/SAP-samples/fsm-extension-installer-kyma/issues/new).

# License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](./LICENSE) file.
