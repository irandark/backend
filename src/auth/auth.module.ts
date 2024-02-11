import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET_TOKEN,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, UserService, JwtStrategy, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
