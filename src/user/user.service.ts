import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ResponseUserDto } from './dto/response-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { TokenService } from 'src/auth/token.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      });

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(user, 'both');

      await this.saveRefreshToken(user, refreshToken);

      return ResponseUserDto.buildResponse(user, accessToken);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при создании пользователя',
      );
    }
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(userId: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async saveRefreshToken(user: User, refreshToken: string) {
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
  }
}
