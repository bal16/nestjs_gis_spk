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

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

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

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();

