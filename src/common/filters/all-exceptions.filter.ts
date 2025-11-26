import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino'; // Gunakan PinoLogger

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const request = ctx.getRequest<unknown>();
    const requestUrl = String(httpAdapter.getRequestUrl(request));

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal Server Error',
    };

    if (httpStatus >= 500) {
      this.logger.error({
        msg: 'Internal Server Error',
        err: exception,
        ...responseBody,
      });
    } else {
      // error 400/401/404 (Client Error)
      this.logger.warn({
        msg: 'Client Error (Operational)',
        err: exception,
        ...responseBody,
      });
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
