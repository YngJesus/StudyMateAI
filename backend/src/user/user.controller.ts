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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findOne(email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') // ⬅️ Tells Swagger which bearer scheme name to use
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
