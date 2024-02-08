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
import { JwtAuthService } from 'src/auth/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(JwtAuthService)
    private jwtService: JwtAuthService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      console.log(hashedPassword);

      const user = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      });

      const { accessToken, refreshToken } =
        await this.jwtService.generateTokens(user);

      await this.saveRefreshToken(user, refreshToken);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token: accessToken,
      };
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

  private async saveRefreshToken(user: User, refreshToken: string) {
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
  }
}
