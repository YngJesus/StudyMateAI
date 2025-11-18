// import {
//   Controller,
//   Post,
//   Get,
//   Delete,
//   Param,
//   Req,
//   UseGuards,
//   UseInterceptors,
//   UploadedFile,
//   Body,
//   Res,
//   Patch,
// } from '@nestjs/common';
// import { PdfsService } from './pdfs.service';
// import { UploadPdfDto } from './dto/upload-pdf.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
// import { pdfStorage } from 'src/config/multer.config';
// import { FileInterceptor } from '@nestjs/platform-express';
// import * as express from 'express';
// import { UpdatePdfDto } from './dto/update-pdf.dto';

// @ApiTags('PDFs')
// @ApiBearerAuth('JWT-auth')
// @UseGuards(JwtAuthGuard)
// @Controller('pdfs')
// export class PdfsController {
//   constructor(private readonly pdfsService: PdfsService) {}

//   @Post('upload')
//   @UseInterceptors(FileInterceptor('file', { storage: pdfStorage }))
//   @ApiConsumes('multipart/form-data')
//   uploadPdf(
//     @Req() req,
//     @UploadedFile() file: Express.Multer.File,
//     @Body() uploadPdfDto: UploadPdfDto,
//   ) {
//     return this.pdfsService.upload(req.user.userId, file, uploadPdfDto);
//   }

//   @Get(':id/download')
//   async download(
//     @Req() req,
//     @Param('id') id: string,
//     @Res() res: express.Response,
//   ) {
//     return this.pdfsService.download(req.user.userId, id, res);
//   }

//   @Get('course/:courseId')
//   findAll(@Req() req, @Param('courseId') courseId: string) {
//     return this.pdfsService.findAll(req.user.userId, courseId);
//   }

//   @Delete(':id')
//   remove(@Req() req, @Param('id') id: string) {
//     return this.pdfsService.remove(req.user.userId, id);
//   }

//   @Patch(':id')
//   updateMetadata(
//     @Req() req,
//     @Param('id') id: string,
//     @Body() updatePdfDto: UpdatePdfDto,
//   ) {
//     return this.pdfsService.updateMetadata(req.user.userId, id, updatePdfDto);
//   }
// }

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  Patch,
} from '@nestjs/common';
import { PdfsService } from './pdfs.service';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { pdfStorage } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import { UpdatePdfDto } from './dto/update-pdf.dto';

@ApiTags('PDFs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('pdfs')
export class PdfsController {
  constructor(private readonly pdfsService: PdfsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: pdfStorage }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'courseId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload',
        },
        courseId: {
          type: 'string',
          format: 'uuid',
          description: 'Course ID this PDF belongs to',
        },
        fileName: {
          type: 'string',
          description: 'Optional custom filename',
        },
        description: {
          type: 'string',
          description: 'Optional description',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags',
        },
      },
    },
  })
  uploadPdf(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPdfDto: UploadPdfDto,
  ) {
    return this.pdfsService.upload(req.user.userId, file, uploadPdfDto);
  }

  @Get(':id/download')
  async download(
    @Req() req,
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    return this.pdfsService.download(req.user.userId, id, res);
  }

  @Get('course/:courseId')
  findAll(@Req() req, @Param('courseId') courseId: string) {
    return this.pdfsService.findAll(req.user.userId, courseId);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.pdfsService.remove(req.user.userId, id);
  }

  @Patch(':id')
  updateMetadata(
    @Req() req,
    @Param('id') id: string,
    @Body() updatePdfDto: UpdatePdfDto,
  ) {
    return this.pdfsService.updateMetadata(req.user.userId, id, updatePdfDto);
  }
}
