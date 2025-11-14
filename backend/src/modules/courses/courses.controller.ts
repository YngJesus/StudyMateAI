import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Req() req, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(req.user.userId, createCourseDto);
  }

  @Get(':subjectId')
  findAll(@Req() req, @Param('subjectId') subjectId: string) {
    return this.coursesService.findAll(req.user.userId, subjectId);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(req.user.userId, id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.coursesService.remove(req.user.userId, id);
  }
}
