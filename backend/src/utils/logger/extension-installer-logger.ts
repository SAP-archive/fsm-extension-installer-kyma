import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class ExtensionInstallerLogger extends Logger {

  constructor(context?: string, isTimestampEnabled?: boolean) {
    super(context, isTimestampEnabled);
  }

  log(message: string) {
    // TODO: call logging endpoint from extension-microservice
    super.log(message);
  }
  error(message: string, trace: string) {
    // TODO: call logging endpoint from extension-microservice
    super.error(message, trace);
  }
  warn(message: string) {
    // TODO: call logging endpoint from extension-microservice
    super.warn(message);
  }
  debug(message: string) {
    // TODO: call logging endpoint from extension-microservice
    super.debug(message);
  }
  verbose(message: string) {
    // TODO: call logging endpoint from extension-microservice
    super.verbose(message);
  }
}
