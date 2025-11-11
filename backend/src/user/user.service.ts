import { BadRequestException, Injectable } from '@nestjs/common';
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

  // findAll() {
  //   return `This action returns all user`;
  // }

  async findOne(email: string): Promise<User | null> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    return existingUser ?? null;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
