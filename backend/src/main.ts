import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';

import {AllExceptionsFilter} from './utils/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(8000, "0.0.0.0");
}

bootstrap();
