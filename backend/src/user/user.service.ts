import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const { email, fullName, password } = createUserDto;

    const existing = await this.userRepository.findOneBy({ email });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      fullName,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = saved;
    return userWithoutPassword;
  }

  async findOne(email: string): Promise<User | null> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    return existingUser ?? null;
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If email is being changed, ensure uniqueness
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new BadRequestException('Email already exists');
      }
      user.email = updateUserDto.email;
    }

    // Update full name if provided
    if (typeof updateUserDto.fullName === 'string' && updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }

    const saved = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = saved;
    return userWithoutPassword; // ← Strip password
  }

  async updatePassword(
    id: string,
    updatePasswordDto: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { currentPassword, newPassword } = updatePasswordDto;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Both currentPassword and newPassword are required',
      );
    }

    const bcrypt = await import('bcrypt');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (
      newPassword.length < 8 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      throw new BadRequestException(
        'New password must be at least 8 characters and include letters and numbers',
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    // strip password before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user as any;
    return {
      message: 'Password updated successfully',
      user: userWithoutPassword,
    };
  }

  async removeUser(userId: string, password: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify password before deleting
    const bcrypt = await import('bcrypt');
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new BadRequestException('Incorrect password');
    }

    await this.userRepository.remove(user);
    return { message: 'Account deleted successfully' };
  }
}
