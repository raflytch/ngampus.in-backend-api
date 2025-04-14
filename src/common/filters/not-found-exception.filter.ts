import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: 'Route not found',
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
