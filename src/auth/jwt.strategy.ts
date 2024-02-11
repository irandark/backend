import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET_TOKEN,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const { userId } = payload;
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
