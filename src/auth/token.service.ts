import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(user: User, tokenType: 'access' | 'refresh' | 'both') {
    const payload = { email: user.email, userId: user.id };
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (tokenType === 'access' || tokenType === 'both') {
      accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_ACCESS_SECRET_TOKEN,
      });
    }

    if (tokenType === 'refresh' || tokenType === 'both') {
      refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET_TOKEN,
      });
    }

    return { accessToken, refreshToken };
  }
}
