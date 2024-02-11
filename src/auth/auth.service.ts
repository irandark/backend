import { TokenService } from './token.service';
import { UserService } from 'src/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

interface DecodedJwt {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: CreateLoginDto) {
    const { password, email } = loginDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Пользователя с таким email не существует',
      );
    }

    const passwordMathes = await bcrypt.compare(password, user.password);

    if (!passwordMathes) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user, 'both');

    await this.userService.saveRefreshToken(user, refreshToken);

    return ResponseUserDto.buildResponse(user, accessToken);
  }

  async refreshToken(user: User) {
    this.verifyRefreshToken(user);

    const { accessToken } = await this.tokenService.generateTokens(
      user,
      'access',
    );

    return accessToken;
  }

  private async verifyRefreshToken(user: User) {
    try {
      const decoded = this.jwtService.verify<DecodedJwt>(user.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET_TOKEN,
      });
      if (this.isExpired(decoded)) {
        const { refreshToken } = await this.tokenService.generateTokens(
          user,
          'refresh',
        );
        await this.userService.saveRefreshToken(user, refreshToken);
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Срок действия refresh token истек');
      }
      throw new Error(error);
    }
  }

  private isExpired(decoded: DecodedJwt): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
}
