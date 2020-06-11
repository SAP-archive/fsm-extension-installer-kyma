import { Test, TestingModule } from '@nestjs/testing';
import { CmdhelperService } from './cmdhelper.service';

jest.mock('child_process');
import childProcess = require('child_process');
import {Readable} from 'stream';

describe('CmdhelperService', () => {
  let service: CmdhelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmdhelperService],
    }).compile();

    service = module.get<CmdhelperService>(CmdhelperService);
  });

  async function testAllCases(isFailedCase: boolean, mockChildProcess: childProcess.ChildProcess) {
    const readable4stdout = new Readable();
    const readable4stderr = new Readable();
    const spy4stdout = jest.spyOn(readable4stdout, 'on').mockReturnValueOnce(null);
    const spy4stderr = jest.spyOn(readable4stderr, 'on').mockReturnValueOnce(null);
    mockChildProcess.stdout = readable4stdout;
    mockChildProcess.stderr = readable4stderr;

    const spy4spawn = jest.spyOn(childProcess, 'spawn').mockReturnValueOnce(mockChildProcess);

    if (isFailedCase) {
      await expect(service.runCmd('helm install test for fail case', [])).rejects.toBe('');
    } else {
      await expect(service.runCmd('helm install test for successful case', [])).resolves.toBe('');
    }

    expect(spy4stdout).toBeCalledTimes(1);
    expect(spy4stderr).toBeCalledTimes(1);
    expect(spy4spawn).toBeCalledTimes(1);

    spy4spawn.mockRestore();
    spy4stderr.mockRestore();
    spy4stdout.mockRestore();
  }

  it('should be invoked for successful case', async () => {
    const child4Ok = {
      on: function(event: string, listener: (code: number, signal: NodeJS.Signals) => void) {
        console.log(event);
        listener(0, null);
      }
    } as childProcess.ChildProcess;

    await testAllCases(false, child4Ok);
  });

  it('should be invoked for failed case', async () => {
    const child4Ok = {
      on: function(event: string, listener: (code: number, signal: NodeJS.Signals) => void) {
        console.log(event);
        listener(1, null);
      }
    } as childProcess.ChildProcess;

    await testAllCases(true, child4Ok);
  });
});
