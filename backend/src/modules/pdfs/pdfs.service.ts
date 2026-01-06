import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pdf } from './entities/pdf.entity';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { UpdatePdfDto } from './dto/update-pdf.dto';

@Injectable()
export class PdfsService {
  constructor(
    @InjectRepository(Pdf) private pdfRepository: Repository<Pdf>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    uploadPdfDto: UploadPdfDto,
  ) {
    if (!file) throw new Error('No file provided');

    // Use 'chat-uploads' directory for PDFs without a course
    const targetDir = uploadPdfDto.courseId || 'chat-uploads';

    // Create the final destination path
    const finalDir = path.join('uploads', 'pdfs', userId, targetDir);
    fs.mkdirSync(finalDir, { recursive: true });

    const finalPath = path.join(finalDir, path.basename(file.path));

    // Move file from temp to final location
    fs.renameSync(file.path, finalPath);

    const pdf = this.pdfRepository.create({
      fileName: uploadPdfDto.fileName || file.originalname,
      filePath: finalPath, // Use the final path
      fileSize: file.size.toString(),
      description: uploadPdfDto.description,
      tags: uploadPdfDto.tags || [],
      courseId: uploadPdfDto.courseId,
    });

    return await this.pdfRepository.save(pdf);
  }

  async findAll(userId: string, courseId: string) {
    // 1. Get course + its subject + the course owner's ID
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['subject', 'subject.user'],
    });

    if (!course) throw new NotFoundException('Course not found');

    // 2. Permission check
    if (course.subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to these PDFs');
    }

    // 3. Return all PDFs for that course
    return await this.pdfRepository.find({
      where: { courseId },
      order: { uploadDate: 'DESC' },
    });
  }

  async remove(userId: string, id: string) {
    // 1. Find PDF + course → subject → user
    const pdf = await this.pdfRepository.findOne({
      where: { id },
      relations: ['course', 'course.subject', 'course.subject.user'],
    });

    if (!pdf) throw new NotFoundException('PDF not found');

    // 2. Permission check
    if (pdf.course && pdf.course.subject.user.id !== userId) {
      throw new ForbiddenException('You do not own this PDF');
    }

    // 3. Delete file from disk
    try {
      fs.unlinkSync(pdf.filePath);
    } catch (e) {
      console.warn('File was already deleted:', e.message);
    }

    // 4. Remove metadata from DB
    await this.pdfRepository.remove(pdf);

    return { success: true };
  }

  async download(userId: string, id: string, res: Response) {
    // 1. Find PDF with course + subject + user
    const pdf = await this.pdfRepository.findOne({
      where: { id },
      relations: ['course', 'course.subject', 'course.subject.user'],
    });

    if (!pdf) {
      throw new NotFoundException('PDF not found');
    }

    // 2. Permission check
    if (pdf.course && pdf.course.subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this PDF');
    }

    // 3. Check if file exists on disk
    if (!fs.existsSync(pdf.filePath)) {
      throw new NotFoundException('File missing on server');
    }

    // 4. Stream file
    const fileStream = fs.createReadStream(pdf.filePath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdf.fileName}"`,
    });

    fileStream.pipe(res);
    // Update last accessed timestamp
    pdf.lastAccessed = new Date();
    await this.pdfRepository.save(pdf);
  }

  async updateMetadata(userId: string, id: string, updatePdfDto: UpdatePdfDto) {
    // 1. Find PDF with course + subject + user
    const pdf = await this.pdfRepository.findOne({
      where: { id },
      relations: ['course', 'course.subject', 'course.subject.user'],
    });
    if (!pdf) {
      throw new NotFoundException('PDF not found');
    }
    // 2. Permission check
    if (pdf.course && pdf.course.subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this PDF');
    }
    // 3. Update metadata
    pdf.fileName = updatePdfDto.fileName || pdf.fileName;
    pdf.description = updatePdfDto.description || pdf.description;
    pdf.tags = updatePdfDto.tags || pdf.tags;
    return await this.pdfRepository.save(pdf);
  }
}
