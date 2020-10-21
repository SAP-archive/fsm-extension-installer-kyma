import { Injectable } from '@nestjs/common';

const spawn = require('child_process').spawn;

@Injectable()
export class CmdhelperService {
    public runCmd(cmd: string, args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const child = spawn(cmd, args);
            let resp = '';
            let error = '';
            child.stdout.on('data', (data) => { resp += data.toString() })
            child.stderr.on('data', (data) => { error += data.toString() })
            child.on('close', (code) => {
                if (code !== 0) {
                    reject(error)
                } else {
                    resolve(resp)
                }
            })
        })
    }
}
