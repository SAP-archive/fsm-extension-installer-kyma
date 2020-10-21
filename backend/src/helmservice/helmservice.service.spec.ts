import { Test, TestingModule } from '@nestjs/testing';
import { CmdhelperServiceModule } from '../cmdhelper/cmdhelper.module';
import { CmdhelperService } from '../cmdhelper/cmdhelper.service';
import { HelmBaseOptions, HelmDeployOptions } from '../utils/interfaces/helmperformoptions.interface';
import { HelmserviceService } from './helmservice.service';
import { ExtensionInstallerLoggerService } from '../utils/logger/extension-installer-logger.service';
import { mockLoggerService } from '../utils/mocks/ExtensionInstallerLoggerService.mock';
import { mockRequestData } from '../utils/mocks/RequestData.mock';

process.env.KYMA_VER = '1.12.0';

describe('HelmserviceService', () => {
  let service: HelmserviceService;
  let cmdhelperService: CmdhelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CmdhelperServiceModule],
      providers: [
        HelmserviceService,
        {
          provide: ExtensionInstallerLoggerService,
          useValue: mockLoggerService
        }
      ],
    }).compile();

    service = module.get<HelmserviceService>(HelmserviceService);
    cmdhelperService = module.get<CmdhelperService>(CmdhelperService);
  });

  async function testSuccessfulInstallCase(isExistingParameters: boolean) {
    const helmDeployOptions = {
      releaseName: 'test-extension',
      namespace: 'default',
      chartLocation: 'helm/Chart.yaml',
      values: isExistingParameters ? Object.assign({imagePullPolicy: 'Always'}) : null
    } as HelmDeployOptions;

    const response = 'install is successful';
    const spy4runCmd = jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.resolve(response));

    const result = await service.install(helmDeployOptions, mockRequestData);
    expect(result.stderr).toBe(null);
    expect(result.stdout).toBe(response);
    expect(spy4runCmd).toBeCalled();

    spy4runCmd.mockRestore();
  }

  it('should be successfully invoked for install', async () => {
    await testSuccessfulInstallCase(true);
  });

  it('should be successfully invoked for install, user not set parameters', async () => {
    await testSuccessfulInstallCase(false);
  });

  it('should throw exception for install due to not namespace', async () => {
    const helmDeployOptions = {
      releaseName: 'test-extension',
      namespace: null,
      chartLocation: 'helm/Chart.yaml',
      values: Object.assign({imagePullPolicy: 'Always'})
    } as HelmDeployOptions;

    await expect(service.install(helmDeployOptions, mockRequestData)).rejects.toThrow('namespace is required');
  });

  it('should throw exception for install due to failure of runCmd method', async () => {
    const helmDeployOptions = {
      releaseName: 'test-extension',
      namespace: 'default',
      chartLocation: 'helm/Chart.yaml',
      values: Object.assign({imagePullPolicy: 'Always'})
    } as HelmDeployOptions;

    delete process.env.KYMA_VER;

    const error4runCmd = new Error('runCmd error');
    const spy4runCmd = jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.reject(error4runCmd));

    const result = await service.install(helmDeployOptions, mockRequestData);
    expect(result.stderr).toBe(error4runCmd);
    expect(spy4runCmd).toBeCalled();

    spy4runCmd.mockRestore();
  });

  it('should be successfully invoked for delete', async () => {
    const helmDeleteOptions = {
      releaseName: 'test-extension',
      namespace: 'default'
    } as HelmBaseOptions;

    const response = 'delete is successful';
    const spy4runCmd = jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.resolve(response));

    const result = await service.delete(helmDeleteOptions, mockRequestData);
    expect(result.stderr).toBe(null);
    expect(result.stdout).toBe(response);
    expect(spy4runCmd).toBeCalled();

    spy4runCmd.mockRestore();
  });

  it('should throw exception for delete, due to failure of runCmd method', async () => {
    const helmDeleteOptions = {
      releaseName: 'test-extension',
      namespace: 'default'
    } as HelmBaseOptions;

    const error4runCmd = new Error('runCmd error for helm delete operating');
    const spy4runCmd = jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.reject(error4runCmd));

    const result = await service.delete(helmDeleteOptions, mockRequestData);
    expect(result.stderr).toBe(error4runCmd);
    expect(spy4runCmd).toBeCalled();

    spy4runCmd.mockRestore();
  });

  it('should be successfully invoked for exist', async () => {
    const helmStatusOptions = {
      releaseName: 'test-extension',
      namespace: 'default'
    } as HelmBaseOptions;

    const response = 'checking is successful';
    const spy4runCmd = jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.resolve(response));

    await expect(service.exist(helmStatusOptions, mockRequestData)).resolves.toBe(true);
    expect(spy4runCmd).toBeCalled();

    spy4runCmd.mockRestore();
  });

  it('should be successfully invoked for exist, but release is not existing', async () => {
    const helmStatusOptions = {
      releaseName: 'test-extension',
      namespace: 'default'
    } as HelmBaseOptions;

    const error = new Error('checking is successful, but release is not exist');
    const spy4runCmd = jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.reject(error));

    await expect(service.exist(helmStatusOptions, mockRequestData)).resolves.toBe(false);
    expect(spy4runCmd).toBeCalled();

    spy4runCmd.mockRestore();
  });
});
