import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { InstallerServiceController } from './installerservice.controller';
import { InstallerService } from './installerservice.service';
import { ChartServiceModule } from '../chartservice/chartservice.module';
import { HelmserviceModule } from '../helmservice/helmservice.module';
import { KubectlModule } from '../kubectl/kubectl.module';
import { ExtensionCatalogServiceModule } from '../extensioncatalogservice/extensioncatalogservice.module';
import { ExtensionInstallerLoggerService } from '../utils/logger/extension-installer-logger.service';
import { mockLoggerService } from '../utils/mocks/ExtensionInstallerLoggerService.mock';

describe('InstallerServiceController', () => {
  let controller: InstallerServiceController;
  let installerService: InstallerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChartServiceModule, HelmserviceModule, KubectlModule, ExtensionCatalogServiceModule],
      providers: [
        InstallerService,
        {
          provide: ExtensionInstallerLoggerService,
          useValue: mockLoggerService
        }
      ],
      controllers: [InstallerServiceController],
    }).compile();

    controller = module.get<InstallerServiceController>(InstallerServiceController);
    installerService = module.get<InstallerService>(InstallerService);
  });

  it('should be invoked for getProbeValue endpoint', () => {
    expect(controller.getProbeValue()).toBe(`It's ok now.`);
  });

  it('should be invoked for installExtension endpoint', async () => {
    const req = {
      body: {
        accountId: 1,
        companyId: 2,
        extensionDeploymentId: 3
      }
    } as Request;
    const res = {
      send: function (body: any) {
        console.log(body);
        return this;
      },
      end: function () {
        console.log('test installExtension method');
      }
    } as Response;

    const spy4installerService = jest.spyOn(installerService, 'installExtension').mockReturnThis();

    await controller.installExtension(req, res);
    expect(spy4installerService).toBeCalledTimes(1);

    spy4installerService.mockRestore();
  });

  it('should be invoked for upgradeExtension endpoint', async () => {
    const req = {
      body: {
        accountId: 1,
        companyId: 2,
        extensionDeploymentId: 3
      }
    } as Request;
    const res = {
      send: function (body: any) {
        console.log(body);
        return this;
      },
      end: function () {
        console.log('test upgradeExtension method');
      }
    } as Response;

    const spy4upgradeExtension = jest.spyOn(installerService, 'upgradeExtension').mockReturnThis();

    await controller.upgradeExtension(req, res);
    expect(spy4upgradeExtension).toBeCalledTimes(1);

    spy4upgradeExtension.mockRestore();
  });

  it('should be invoked for uninstallExtension endpoint', async () => {
    const req = {
      body: {
        accountId: 1,
        companyId: 2,
        helmRelease: 'test-extension',
        namespace: 'default'
      }
    } as Request;
    const res = {
      send: function (body: any) {
        console.log(body);
        return this;
      },
      end: function () {
        console.log('test uninstallExtension method');
      }
    } as Response;

    const spy4uninstallExtension = jest.spyOn(installerService, 'uninstallExtension').mockReturnThis();

    await controller.uninstallExtension(req, res);
    expect(spy4uninstallExtension).toBeCalledTimes(1);

    spy4uninstallExtension.mockRestore();
  });
});
