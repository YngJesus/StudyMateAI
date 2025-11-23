import { Module } from '@nestjs/common';
import { PdfsService } from './pdfs.service';
import { PdfsController } from './pdfs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './entities/pdf.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pdf]), CoursesModule],
  controllers: [PdfsController],
  providers: [PdfsService],
  exports: [TypeOrmModule],
})
export class PdfsModule {}
