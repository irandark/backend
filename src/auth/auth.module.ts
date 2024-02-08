import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtAuthService } from './jwt.service';

@Module({
  imports: [JwtModule.register({}), PassportModule.register({})],
  providers: [AuthService, JwtAuthService],
  controllers: [AuthController],
})
export class AuthModule {}
