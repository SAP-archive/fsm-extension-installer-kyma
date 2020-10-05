import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from './utils/all-exceptions.filter';
import { ExtensionInstallerLogger } from 'src/utils/logger/extension-installer-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.useLogger(new ExtensionInstallerLogger())

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(8000, "0.0.0.0");
}

bootstrap();
