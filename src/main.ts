import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);

  //Open API Documentation
  const config = new DocumentBuilder()
    .setTitle('KAMIX Conformity Application')
    .setDescription('KAMIX Conformity Rest API Docs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //Cross-origin Configurations
  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    preflightContinue: true,
    optionsSuccessStatus: 200,
    credentials: true,
  };

  app.enableCors(options);

  const port = configService.get('PORT') ?? 5000;

  await app.listen(port);
  console.log(`Application Is Running on port ${port}`);
}
bootstrap();
