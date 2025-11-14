import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Req() req, @Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(req.user.userId, createSubjectDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.subjectsService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(req.user.userId, updateSubjectDto, id);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.subjectsService.remove(req.user.userId, id);
  }
}
