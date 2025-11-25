import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@ApiTags('Profile')
@UseGuards(JwtAuthGuard) // ✅ Apply guard to entire controller
@ApiBearerAuth('JWT-auth')
@Controller('profile') // ✅ Cleaner route
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req) {
    return this.userService.getUserProfile(req.user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.userId, updateUserDto);
  }

  @Patch('password') // ✅ No :id needed!
  @ApiOperation({ summary: 'Change password' })
  updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(req.user.userId, updatePasswordDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete account (requires password confirmation)' })
  remove(@Req() req, @Body() deleteAccountDto: DeleteAccountDto) {
    return this.userService.removeUser(
      req.user.userId,
      deleteAccountDto.password,
    );
  }
}
