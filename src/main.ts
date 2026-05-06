import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger, PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const httpAdapter = app.get(HttpAdapterHost);

  const pinoLogger = await app.resolve(PinoLogger);

  pinoLogger.setContext('GlobalFilter');

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, pinoLogger));

  await app.listen(process.env.PORT ?? 3001);
  app.useGlobalPipes(new ValidationPipe());
}
bootstrap();
