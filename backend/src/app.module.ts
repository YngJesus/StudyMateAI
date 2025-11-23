import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PdfsModule } from './modules/pdfs/pdfs.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
      envFilePath: '.env',
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    UserModule,

    AuthModule,

    SubjectsModule,

    CoursesModule,

    PdfsModule,

    ChatModule,

    // Feature modules will be added here later
    // Example: AuthModule, SubjectsModule, etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
