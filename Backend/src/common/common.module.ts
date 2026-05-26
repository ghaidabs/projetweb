import { Module } from '@nestjs/common';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  providers: [LoggingMiddleware],
  exports: [LoggingMiddleware],
})
export class CommonModule {}
