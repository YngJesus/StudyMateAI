import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const bcrypt = await import('bcrypt');
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;

    return { access_token: token, user: userWithoutPassword };
  }

  async signup(createUserDto: CreateUserDto) {
    // 1. Check if user already exists
    const existing = await this.userService.findOne(createUserDto.email);
    if (existing) throw new BadRequestException('Email already exists');

    // 2. Create user in DB (UserService already hashes)
    const user = await this.userService.createUser(createUserDto);

    // 3. Sign JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token, user };
  }
}
