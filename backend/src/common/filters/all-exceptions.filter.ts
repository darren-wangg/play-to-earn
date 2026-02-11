import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'http';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      // Pass through structured responses (e.g., from @nestjs/terminus health checks)
      if (request.path === '/health' && typeof res === 'object') {
        return response.status(statusCode).json(res);
      }

      message =
        typeof res === 'string'
          ? res
          : (res as { message?: string | string[] }).message
            ? Array.isArray((res as { message: string | string[] }).message)
              ? ((res as { message: string[] }).message).join(', ')
              : ((res as { message: string }).message)
            : exception.message;
    } else {
      this.logger.error(
        'Unexpected exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      error: STATUS_CODES[statusCode] || 'Unknown Error',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
