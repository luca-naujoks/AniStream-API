import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import { Configuration } from 'crawlee';

async function bootstrap() {
  Configuration.getGlobalConfig().set('persistStorage', false);

  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('AniStream API')
    .setDescription(
      'The AniStream API is a universal backend for media servers',
    )
    .setVersion('1.4')
    .addTag('Setup', 'Setup related Endpoints')
    .addTag('Media', 'Media object related Endpoints')
    .addTag('DetailedMedia', 'DetailedMedia related Endpoints')
    .addTag('Providers', 'Provider related Endpoints')
    .addTag('Watchlist', 'Watchlist related Endpoints')
    .addTag('Telemetrics', 'Telemetric and Analysis related Endoints')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
