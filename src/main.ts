import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')


  //Open API Documentation
  const config = new DocumentBuilder()
    .setTitle('KAMIX Conformity API')
    .setDescription('KAMIX Conformity API')
    .setVersion('1.0')
    .addTag('Conformity')
    .build(); 
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  //Cross-origin Configurations
  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    preflightContinue: true,
    optionsSuccessStatus: 20,
    credentials: true,
  };

  app.enableCors(options);
  
  await app.listen(3000);
  console.log('Application Is Running on port 3000')
}
bootstrap();
