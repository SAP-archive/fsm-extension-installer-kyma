import { Module } from '@nestjs/common';
import { InstallerServiceController } from './installerservice.controller';
import { InstallerService } from './installerservice.service';
import {ChartServiceModule} from '../chartservice/chartservice.module';
import {ExtensionCatalogServiceModule} from '../extensioncatalogservice/extensioncatalogservice.module';
import {HelmserviceModule} from '../helmservice/helmservice.module';
import {KubectlModule} from '../kubectl/kubectl.module';

@Module({
  imports: [ChartServiceModule, ExtensionCatalogServiceModule, HelmserviceModule, KubectlModule],
  controllers: [InstallerServiceController],
  providers: [InstallerService]
})
export class InstallerServiceModule {}
