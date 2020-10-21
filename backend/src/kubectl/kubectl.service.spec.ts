import { Test, TestingModule } from '@nestjs/testing';
import { KubectlService } from './kubectl.service';
import { CmdhelperServiceModule } from '../cmdhelper/cmdhelper.module';
import { CmdhelperService } from '../cmdhelper/cmdhelper.service';
import { ExtensionInstallerLoggerService } from '../utils/logger/extension-installer-logger.service';
import { mockLoggerService } from '../utils/mocks/ExtensionInstallerLoggerService.mock';
import { mockRequestData } from '../utils/mocks/RequestData.mock';

describe('KubectlService', () => {
  let service: KubectlService;
  let cmdhelperService: CmdhelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CmdhelperServiceModule],
      providers: [
        KubectlService,
        {
          provide: ExtensionInstallerLoggerService,
          useValue: mockLoggerService
        }
      ],
    }).compile();

    service = module.get<KubectlService>(KubectlService);
    cmdhelperService = module.get<CmdhelperService>(CmdhelperService);
  });

  it('should return accessUrl for virtualservices type', async () => {
    const response = {
      spec: {
        hosts: [
            'console.kongfu.kaka.shoot.canary.k8s-hana.ondemand.com'
        ]
      }
    };
    const spy4cmdRun =
        jest.spyOn(cmdhelperService, 'runCmd').mockImplementationOnce(() => Promise.resolve(JSON.stringify(response)));

    const accessUrl = await service.getAccessUrlFromKymaByAppName('test-extension', 'default', mockRequestData);
    expect(spy4cmdRun).toBeCalled();
    expect(accessUrl).toBe('https://' + response.spec.hosts[0]);

    spy4cmdRun.mockRestore();
  });

  it('should throw exception, due to namespace is empty', async () => {
    await expect(service.getAccessUrlFromKymaByAppName('test-extension', '', mockRequestData)).rejects.toThrow('namespace is required');
  });

  it('should return accessurl for APIRule way', async () => {
    const error = new Error('kyma version is greater than or equal to 1.12.0');
    const response = {
      items: [
        {
          spec: {
            hosts: [
              'console.kongfu.kaka.shoot.canary.k8s-hana.ondemand.com'
            ]
          }
        }
      ]
    };
    const spy4cmdRun =
        jest.spyOn(cmdhelperService, 'runCmd').mockRejectedValueOnce(error).mockResolvedValue(JSON.stringify(response));

    const accessUrl = await service.getAccessUrlFromKymaByAppName('test-extension', 'default', mockRequestData);
    expect(accessUrl).toBe('https://' + response.items[0].spec.hosts[0]);
    expect(spy4cmdRun).toBeCalledTimes(2);

    spy4cmdRun.mockRestore();
  });

  it('should throw exception for APIRule way', async () => {
    const error = new Error(`Can't find the relevant VirtualService`);
    const spy4cmdRun =
        jest.spyOn(cmdhelperService, 'runCmd').mockRejectedValueOnce(error).mockRejectedValueOnce(error);

    await expect(service.getAccessUrlFromKymaByAppName('test-extension', 'default', mockRequestData)).rejects.toThrowError(error);
    expect(spy4cmdRun).toBeCalledTimes(2);

    spy4cmdRun.mockRestore();
  });
});
