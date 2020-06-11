import { Test, TestingModule } from '@nestjs/testing';
import { InstallerService } from './installerservice.service';
import {ExtensionCatalogServiceModule} from '../extensioncatalogservice/extensioncatalogservice.module';
import {ChartServiceModule} from '../chartservice/chartservice.module';
import {HelmserviceModule} from '../helmservice/helmservice.module';
import {KubectlModule} from '../kubectl/kubectl.module';
import {RequestInstallData, RequestUninstallData} from '../utils/interfaces/requestdata.interface';
import {ExtensionCatalogService} from '../extensioncatalogservice/extensioncatalogservice.service';
import {DeployConfigData} from '../utils/interfaces/deployconfigdata.interface';
import {ChartserviceService} from '../chartservice/chartservice.service';
import {HelmserviceService} from '../helmservice/helmservice.service';
import {KubectlService} from '../kubectl/kubectl.service';

jest.mock('recursive-search');
import search = require('recursive-search');
jest.mock('yamljs');
import yamljs = require('yamljs');

describe('InstallerService', () => {
  let service: InstallerService;
  let extensionCatalogService: ExtensionCatalogService;
  let chartserviceService: ChartserviceService;
  let helmserviceService: HelmserviceService;
  let kubectlService: KubectlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExtensionCatalogServiceModule, ChartServiceModule, HelmserviceModule, KubectlModule],
      providers: [InstallerService],
    }).compile();

    service = module.get<InstallerService>(InstallerService);
    extensionCatalogService = module.get<ExtensionCatalogService>(ExtensionCatalogService);
    chartserviceService = module.get<ChartserviceService>(ChartserviceService);
    helmserviceService = module.get<HelmserviceService>(HelmserviceService);
    kubectlService = module.get<KubectlService>(KubectlService);
  });

  async function testSuccessfullyDeployExtension(isUpgradeFlow: boolean, isMockAccessUrlEmpty: boolean) {
    const requestData = {
      accountId: '1',
      companyId: '2',
      extensionDeploymentId: '2af11761-37bb-4aea-bc8a-f2b8ff4cca69'
    } as RequestInstallData;

    const deployConfigData = {
      chartConfigData: {
        path: isUpgradeFlow ? 'chartpath' : ''
      },
      lastHelmContent: {
        helmRelease: 'test-extension',
        namespace: 'default'
      },
      appVersion: '1.0.0'
    } as DeployConfigData;
    const spy4getDeploymentConfigData =
        jest.spyOn(extensionCatalogService, 'getDeploymentConfigData').mockReturnValueOnce(Promise.resolve(deployConfigData));

    const repoLocalPath = '';
    const spy4downloadChartFromGithubRepo =
        jest.spyOn(chartserviceService, 'downloadChartFromGithubRepo').mockReturnValueOnce(Promise.resolve(repoLocalPath));

    const chartPaths = ['/helm/Chart.yaml'];
    const spy4recursiveSearchSync =
        jest.spyOn(search, 'recursiveSearchSync').mockReturnValue(chartPaths);

    const chartMetadata = {
      name: 'test-extension'
    };
    const spy4load =
        jest.spyOn(yamljs, 'load').mockReturnValue(chartMetadata);

    const spy4exist =
        jest.spyOn(helmserviceService, 'exist').mockReturnValueOnce(Promise.resolve(true));
    const spy4delete =
        jest.spyOn(helmserviceService, 'delete').mockReturnThis();

    const installResult = {
      stderr: null,
      stdout: {
        name: 'test-extension',
        namespace: 'default',
        info: {
          notes: 'notes',
          description: 'description'
        }
      }
    };
    const spy4install =
        jest.spyOn(helmserviceService, 'install').mockReturnValueOnce(Promise.resolve(installResult));
    const spy4jsonParse =
        jest.spyOn(JSON, 'parse').mockReturnValueOnce(installResult.stdout);

    const accessUrl = isMockAccessUrlEmpty ? undefined : `https://console.kongfu.kaka.shoot.canary.k8s-hana.ondemand.com`;
    const spy4getAccessUrlFromKymaByAppName =
        jest.spyOn(kubectlService, 'getAccessUrlFromKymaByAppName').mockReturnValueOnce(Promise.resolve(accessUrl));

    const spy4updateDeploymentInfoToCatalog =
        jest.spyOn(extensionCatalogService, 'updateDeploymentInfoToCatalog').mockReturnThis();

    const spy4addDeploymentResultToCatalog =
        jest.spyOn(extensionCatalogService, 'addDeploymentResultToCatalog').mockReturnThis();

    const spy4removeDownloadedPath =
        jest.spyOn(chartserviceService, 'removeDownloadedPath').mockReturnThis();

    if (isUpgradeFlow) {
      await service.upgradeExtension(requestData);
    } else {
      await service.installExtension(requestData);
    }

    expect(spy4getDeploymentConfigData).toBeCalled();
    expect(spy4downloadChartFromGithubRepo).toBeCalled();
    if (!isUpgradeFlow) {
      expect(spy4recursiveSearchSync).toBeCalled();
    }
    expect(spy4load).toBeCalled();
    expect(spy4exist).toBeCalled();
    expect(spy4delete).toBeCalled();
    expect(spy4install).toBeCalled();
    expect(spy4jsonParse).toBeCalled();
    expect(spy4getAccessUrlFromKymaByAppName).toBeCalled();
    expect(spy4updateDeploymentInfoToCatalog).toBeCalled();
    expect(spy4addDeploymentResultToCatalog).toBeCalled();
    expect(spy4removeDownloadedPath).toBeCalled();

    spy4removeDownloadedPath.mockRestore();
    spy4addDeploymentResultToCatalog.mockRestore();
    spy4updateDeploymentInfoToCatalog.mockRestore();
    spy4getAccessUrlFromKymaByAppName.mockRestore();
    spy4jsonParse.mockRestore();
    spy4install.mockRestore();
    spy4delete.mockRestore();
    spy4exist.mockRestore();
    spy4load.mockRestore();
    spy4recursiveSearchSync.mockRestore();
    spy4downloadChartFromGithubRepo.mockRestore();
    spy4getDeploymentConfigData.mockRestore();
  }

  it('should be successfully invoked for installExtension', async () => {
    await testSuccessfullyDeployExtension(false, false);
    await testSuccessfullyDeployExtension(false, true);
  });

  it('should be successfully invoked for upgradeExtension', async () => {
    await testSuccessfullyDeployExtension(true, false);
    await testSuccessfullyDeployExtension(true, true);
  });

  it('should be successfully invoked for uninstallExtension', async () => {
    const requestData = {
      releaseName: 'test-extension',
      namespace: 'default'
    } as RequestUninstallData;

    const spy4delete = jest.spyOn(helmserviceService, 'delete').mockReturnThis();

    await service.uninstallExtension(requestData);
    expect(spy4delete).toBeCalledTimes(1);

    spy4delete.mockRestore();
  });

  async function testFailedDeployExtension(isUpgradeFlow: boolean,
                                           isMiss4chartFile: boolean,
                                           isMissName4chartmetadata: boolean,
                                           isInstallException: boolean) {
    const requestData = {
      accountId: '1',
      companyId: '2',
      extensionDeploymentId: '2af11761-37bb-4aea-bc8a-f2b8ff4cca69'
    } as RequestInstallData;

    const deployConfigData = {
      chartConfigData: {
        path: ''
      },
      lastHelmContent: {
        helmRelease: 'test-extension',
        namespace: 'default'
      }
    } as DeployConfigData;
    const spy4getDeploymentConfigData =
        jest.spyOn(extensionCatalogService, 'getDeploymentConfigData').mockReturnValueOnce(Promise.resolve(deployConfigData));

    const repoLocalPath = '';
    const spy4downloadChartFromGithubRepo =
        jest.spyOn(chartserviceService, 'downloadChartFromGithubRepo').mockReturnValueOnce(Promise.resolve(repoLocalPath));

    const chartFiles = [];
    if (!isMiss4chartFile) {
      chartFiles[0] = 'helm/nginx';
    }
    const spy4recursiveSearchSync =
        jest.spyOn(search, 'recursiveSearchSync').mockReturnValue(chartFiles);

    const spy4load =
        jest.spyOn(yamljs, 'load').mockReturnValue(isMissName4chartmetadata ? null : {name: 'test-deployment-exception'});

    const spy4exist =
        jest.spyOn(helmserviceService, 'exist').mockReturnValueOnce(Promise.resolve(false));

    const response = {
      stderr: 'test install exception',
      stdout: null
    };
    const spy4install =
        jest.spyOn(helmserviceService, 'install').mockReturnValueOnce(Promise.resolve(response));

    const spy4updateDeploymentInfoToCatalog =
        jest.spyOn(extensionCatalogService, 'updateDeploymentInfoToCatalog').mockReturnThis();

    const spy4addDeploymentResultToCatalog =
        jest.spyOn(extensionCatalogService, 'addDeploymentResultToCatalog').mockReturnThis();

    const spy4removeDownloadedPath =
        jest.spyOn(chartserviceService, 'removeDownloadedPath').mockReturnThis();

    let message = null;
    if (isMiss4chartFile) {
      message = `Chart.yaml file is required.`;
    } else if (isMissName4chartmetadata) {
      message =  `Name is required in Chart.yaml file.`;
    } else if (isInstallException) {
      message = response.stderr;
    }
    const error = new Error(message);

    if (isUpgradeFlow) {
      await expect(service.upgradeExtension(requestData)).rejects.toThrowError(error);
    } else {
      await expect(service.installExtension(requestData)).rejects.toThrowError(error);
    }

    expect(spy4getDeploymentConfigData).toBeCalled();
    expect(spy4downloadChartFromGithubRepo).toBeCalled();
    expect(spy4recursiveSearchSync).toBeCalled();
    if (!isMiss4chartFile) {
      expect(spy4load).toBeCalled();
    }
    if (isInstallException) {
      expect(spy4exist).toBeCalled();
      expect(spy4install).toBeCalled();
    }
    expect(spy4updateDeploymentInfoToCatalog).toBeCalled();
    expect(spy4addDeploymentResultToCatalog).toBeCalled();
    expect(spy4removeDownloadedPath).toBeCalled();

    spy4removeDownloadedPath.mockRestore();
    spy4addDeploymentResultToCatalog.mockRestore();
    spy4updateDeploymentInfoToCatalog.mockRestore();
    spy4install.mockRestore();
    spy4exist.mockRestore();
    spy4load.mockRestore();
    spy4recursiveSearchSync.mockRestore();
    spy4downloadChartFromGithubRepo.mockRestore();
    spy4getDeploymentConfigData.mockRestore();
  }

  it('Not found Chart metadata for install or upgrade', async () => {
    await testFailedDeployExtension(false,
        true,
        false,
        false);
  });

  it(`Not found 'name' field in Chart metadata file`, async () => {
    await testFailedDeployExtension(false,
        false,
        true,
        false);
  });

  it('Throw exception for helm install operating', async () => {
    await testFailedDeployExtension(true,
        false,
        false,
        true);
  });
});
