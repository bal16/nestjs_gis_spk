import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger, PinoLogger } from 'nestjs-pino';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const httpAdapter = app.get(HttpAdapterHost);

  const pinoLogger = await app.resolve(PinoLogger);

  pinoLogger.setContext('GlobalFilter');

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, pinoLogger));

  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const openApiFilePath = path.join(process.cwd(), 'docs', 'OpenApi.yaml');
    if (fs.existsSync(openApiFilePath)) {
      const yamlFile = fs.readFileSync(openApiFilePath, 'utf8');
      const openApiDocument = YAML.parse(yamlFile);

      app.use(
        '/api/docs',
        apiReference({
          spec: {
            content: openApiDocument,
          },
        }),
      );
    }
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

