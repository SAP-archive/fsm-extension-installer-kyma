import {HttpModule, Module} from '@nestjs/common';
import { ExtensionCatalogService } from './extensioncatalogservice.service';

@Module({
  providers: [ExtensionCatalogService],
  exports: [ExtensionCatalogService],
  imports: [HttpModule]
})
export class ExtensionCatalogServiceModule {}
