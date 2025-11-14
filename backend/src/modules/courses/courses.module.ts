import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), SubjectsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
