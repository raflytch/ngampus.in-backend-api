import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './common/config/config.service';
import { NotFoundExceptionFilter } from './common/filters/not-found-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalFilters(new NotFoundExceptionFilter());

  await app.listen(configService.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
