import { Module } from '@nestjs/common';
import { ChartserviceService } from './chartservice.service';

@Module({
  providers: [ChartserviceService],
  exports: [ChartserviceService]
})
export class ChartServiceModule {}
