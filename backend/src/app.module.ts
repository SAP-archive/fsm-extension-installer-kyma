import { Module } from '@nestjs/common';
import { InstallerServiceModule } from './installerservice/installerservice.module';

@Module({
  imports: [InstallerServiceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
