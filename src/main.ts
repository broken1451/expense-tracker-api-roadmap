import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger:['error', 'warn', 'log']
  });
  const logger = new Logger('bootstrap');
  app.enableCors({ origin: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<string>('port'); 

  await app.listen(port);
  logger.log(`Microservicio de correos iniciado en puerto ${port}`);
}
bootstrap();
