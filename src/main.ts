import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  //Open API Documentation
  const config = new DocumentBuilder()
    .setTitle('KAMIX Conformity API')
    .setDescription('KAMIX Conformity API')
    .setVersion('1.0')
    .addTag('Conformity')
    .build(); 
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  //Cross-origin Configurations
  app.enableCors();
  
  await app.listen(3000);
  console.log('Application Is Running on port 3000')
}
bootstrap();
