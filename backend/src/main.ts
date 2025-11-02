import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (so frontend can connect)
  // app.enableCors({
  //   origin: ['http://localhost:4200', 'http://localhost:3000'],
  //   credentials: true,
  // });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('StudyMate AI API')
    .setDescription(
      'API documentation for StudyMate - Intelligent Study Companion',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Subjects', 'Subject management endpoints')
    .addTag('Courses', 'Course management endpoints')
    .addTag('PDFs', 'PDF file management endpoints')
    .addTag('AI', 'AI-powered features (summarization, quiz, chat)')
    .addTag('Calendar', 'Events and deadlines management')
    .addTag('Dashboard', 'Dashboard and statistics endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keeps token even after page refresh
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  🚀 Backend is running on: http://localhost:${port}
  📚 Swagger docs available at: http://localhost:${port}/api/docs
  🗄️  Database: PostgreSQL on localhost:5432
  🖥️  pgAdmin: http://localhost:5050
  `);
}
bootstrap();
