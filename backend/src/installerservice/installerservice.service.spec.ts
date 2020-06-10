import { Test, TestingModule } from '@nestjs/testing';
import { InstallerService } from './installerservice.service';
import {ExtensionCatalogServiceModule} from '../extensioncatalogservice/extensioncatalogservice.module';
import {ChartServiceModule} from '../chartservice/chartservice.module';
import {HelmserviceModule} from '../helmservice/helmservice.module';
import {KubectlModule} from '../kubectl/kubectl.module';
import {RequestInstallData} from '../utils/interfaces/requestdata.interface';
import {ExtensionCatalogService} from '../extensioncatalogservice/extensioncatalogservice.service';
import {DeployConfigData} from '../utils/interfaces/deployconfigdata.interface';
import {ChartserviceService} from '../chartservice/chartservice.service';
import {HelmserviceService} from '../helmservice/helmservice.service';
import {KubectlService} from '../kubectl/kubectl.service';

jest.mock('recursive-search');
jest.mock('yamljs');
import search = require('recursive-search');
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

  it('should be successfully invoked for installExtension', async () => {
    const requestData = {
      accountId: '1',
      companyId: '2',
      extensionDeploymentId: '2af11761-37bb-4aea-bc8a-f2b8ff4cca69'
    } as RequestInstallData;

    const deployConfigData = {
      chartConfigData: {
        path: ''
      }
    } as DeployConfigData;
    const spy4getDeploymentConfigData =
        jest.spyOn(extensionCatalogService, 'getDeploymentConfigData').mockReturnValueOnce(Promise.resolve(deployConfigData));

    const repoLocalPath = '';
    const spy4downloadChartFromGithubRepo =
        jest.spyOn(chartserviceService, 'downloadChartFromGithubRepo').mockReturnValueOnce(Promise.resolve(repoLocalPath));

    const chartPaths = ['/helm/Chart.yaml'];
    const spy4recursiveSearchSync =
        jest.spyOn(search, 'recursiveSearchSync').mockReturnValueOnce(chartPaths);

    const chartMetadata = {
      name: 'test-extension'
    };
    const spy4load =
        jest.spyOn(yamljs, 'load').mockReturnValueOnce(chartMetadata);

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

    const accessUrl = `https://console.kongfu.kaka.shoot.canary.k8s-hana.ondemand.com`;
    const spy4getAccessUrlFromKymaByAppName =
        jest.spyOn(kubectlService, 'getAccessUrlFromKymaByAppName').mockReturnValueOnce(Promise.resolve(accessUrl));

    const spy4updateDeploymentInfoToCatalog =
        jest.spyOn(extensionCatalogService, 'updateDeploymentInfoToCatalog').mockReturnThis();

    const spy4addDeploymentResultToCatalog =
        jest.spyOn(extensionCatalogService, 'addDeploymentResultToCatalog').mockReturnThis();

    const spy4removeDownloadedPath =
        jest.spyOn(chartserviceService, 'removeDownloadedPath').mockReturnThis();

    await service.installExtension(requestData);
    expect(spy4getDeploymentConfigData).toBeCalledTimes(1);
    expect(spy4downloadChartFromGithubRepo).toBeCalledTimes(1);
    expect(spy4recursiveSearchSync).toBeCalledTimes(1);
    expect(spy4load).toBeCalledTimes(1);
    expect(spy4exist).toBeCalledTimes(1);
    expect(spy4delete).toBeCalledTimes(1);
    expect(spy4install).toBeCalledTimes(1);
    expect(spy4jsonParse).toBeCalledTimes(1);
    expect(spy4getAccessUrlFromKymaByAppName).toBeCalledTimes(1);
    expect(spy4updateDeploymentInfoToCatalog).toBeCalledTimes(1);
    expect(spy4addDeploymentResultToCatalog).toBeCalledTimes(1);
    expect(spy4removeDownloadedPath).toBeCalledTimes(1);
  });

  it('should be successfully invoked for upgradeExtension', async () => {

  });

  it('should be successfully invoked for uninstallExtension', async () => {

  });
});
