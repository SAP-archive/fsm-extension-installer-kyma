import { Module } from '@nestjs/common';
import { CmdhelperService } from './cmdhelper.service';

@Module({
  providers: [CmdhelperService],
  exports: [CmdhelperService]
})
export class CmdhelperServiceModule {}