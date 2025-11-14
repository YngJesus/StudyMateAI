import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  // Exporting TypeOrmModule here re-exports the repository providers
  // so other modules that import SubjectsModule (for example CoursesModule)
  // can inject the Subject repository via @InjectRepository(Subject).
  exports: [TypeOrmModule],
})
export class SubjectsModule {}
