import { Test, TestingModule } from '@nestjs/testing';
import {HttpModule, HttpService} from '@nestjs/common';
import {empty} from 'rxjs';
import { ExtensionCatalogService } from './extensioncatalogservice.service';
import {RequestInstallData} from '../utils/interfaces/requestdata.interface';
import {DeployConfigData} from '../utils/interfaces/deployconfigdata.interface';
import {UpdatedDeployData} from '../utils/interfaces/updateddeploydata.interface';
import {DeployResultData} from '../utils/interfaces/deployresultdata.interface';

describe('ExtensionCatalogService', () => {
  let service: ExtensionCatalogService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ExtensionCatalogService],
    }).compile();

    service = module.get<ExtensionCatalogService>(ExtensionCatalogService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be successfully invoked for getDeploymentConfigData', async () => {
    const requestData = {
      accountId: '1',
      companyId: '2',
      extensionDeploymentId: '3'
    } as RequestInstallData;

    const fakeObservable = empty();

    const resultData = {
      data: {
        deploymentConfig: {
          namespace: 'default',
          values: 'values'
        },
        extension: {
          version: '1.0.0',
          artifactConfig: {
            chart: {
              repository: 'https://github.com',
              ref: 'master',
              path: 'helm'
            }
          }
        },
        latestSuccessfulDeployResult: {
          content: {
            helmRelease: 'test_extension',
            namespace: 'default'
          }
        }
      }
    };

    const testData = {
      namespace: resultData.data.deploymentConfig.namespace,
      parameterValues: resultData.data.deploymentConfig.values,
      appVersion: resultData.data.extension.version,
      chartConfigData: {
        repository: resultData.data.extension.artifactConfig.chart.repository,
        ref: resultData.data.extension.artifactConfig.chart.ref,
        path: resultData.data.extension.artifactConfig.chart.path
      },
      lastHelmContent: {
        helmRelease: resultData.data.latestSuccessfulDeployResult.content.helmRelease,
        namespace: resultData.data.latestSuccessfulDeployResult.content.namespace
      }
    } as DeployConfigData;

    const spy4get = jest.spyOn(httpService, 'get').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.resolve(resultData));

    const responseData = await service.getDeploymentConfigData(requestData);
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
    expect(responseData).toStrictEqual(testData);
  });

  it('different response data, should be successfully invoked for getDeploymentConfigData', async () => {
    const requestData = {
      accountId: '1',
      companyId: '2',
      extensionDeploymentId: '3'
    } as RequestInstallData;

    const fakeObservable = empty();

    const resultData = {
      data: {
        extension: {
          version: '1.0.0',
          artifactConfig: {
            chart: {
              repository: 'https://github.com',
              ref: 'master',
              path: 'helm'
            }
          }
        }
      }
    };

    const testData = {
      namespace: 'default',
      parameterValues: null,
      appVersion: resultData.data.extension.version,
      chartConfigData: {
        repository: resultData.data.extension.artifactConfig.chart.repository,
        ref: resultData.data.extension.artifactConfig.chart.ref,
        path: resultData.data.extension.artifactConfig.chart.path
      },
      lastHelmContent: {
        helmRelease: null,
        namespace: null
      }
    } as DeployConfigData;

    const spy4get = jest.spyOn(httpService, 'get').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.resolve(resultData));

    const responseData = await service.getDeploymentConfigData(requestData);
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
    expect(responseData).toStrictEqual(testData);
  });

  it('should throw exception for getDeploymentConfigData', async () => {
    const requestData = {
      accountId: '1',
      companyId: '2',
      extensionDeploymentId: '3'
    } as RequestInstallData;

    const fakeObservable = empty();
    const error = new Error('test that throw exception for httpService.get method');
    const spy4get = jest.spyOn(httpService, 'get').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.reject(error));

    await expect(service.getDeploymentConfigData(requestData)).rejects.toThrowError(error);
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
  });

  it('should be successfully invoked for updateDeploymentInfoToCatalog', async () => {
    const updatedDeployData = {
      accountId: '1',
      companyId: '2',
      version: null,
      state: 'INSTALLED',
      accessUrl: 'https://testIsSuccessful.com'
    } as UpdatedDeployData;

    const fakeObservable = empty();
    const spy4get = jest.spyOn(httpService, 'patch').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.resolve(updatedDeployData));

    await expect(service.updateDeploymentInfoToCatalog(updatedDeployData));
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
  });

  it('should throw exception for updateDeploymentInfoToCatalog', async () => {
    const updatedDeployData = {
      accountId: '1',
      companyId: '2',
      version: '1.0.0',
      state: 'INSTALLED',
      accessUrl: 'https://testIsSuccessful.com'
    } as UpdatedDeployData;

    const fakeObservable = empty();
    const error = new Error('test that throw exception for httpService.patch method');
    const spy4get = jest.spyOn(httpService, 'patch').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.reject(error));

    await expect(service.updateDeploymentInfoToCatalog(updatedDeployData)).rejects.toThrowError(error);
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
  });

  it('should be successfully invoked for addDeploymentResultToCatalog', async () => {
    const deployResultData = {
      extensionDeploymentId: '1',
      accountId: '1',
      companyId: '2',
      log: 'deployed log info',
      shortMessage: 'install extension',
      content: {
        helmRelease: 'test-extension',
        namespace: 'default'
      }
    } as DeployResultData;

    const fakeObservable = empty();
    const spy4get = jest.spyOn(httpService, 'post').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.resolve(deployResultData));

    await expect(service.addDeploymentResultToCatalog(deployResultData));
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
  });

  it('should throw exception for addDeploymentResultToCatalog', async () => {
    const deployResultData = {
      extensionDeploymentId: '1',
      accountId: '1',
      companyId: '2',
      log: 'deployed log info',
      shortMessage: 'install extension',
      content: null
    } as DeployResultData;

    const fakeObservable = empty();
    const error = new Error('test that throw exception for httpService.post method');
    const spy4get = jest.spyOn(httpService, 'post').mockImplementation(() => fakeObservable);
    const spy4promise = jest.spyOn(fakeObservable, 'toPromise').mockImplementation(() => Promise.reject(error));

    await expect(service.addDeploymentResultToCatalog(deployResultData)).rejects.toThrowError(error);
    expect(spy4get).toBeCalled();
    expect(spy4promise).toBeCalled();
  });
});
