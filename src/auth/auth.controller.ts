import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateLoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: CreateLoginDto) {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  async refreshToken(
    @Req()
    req: {
      user: User;
    },
  ) {
    return this.authService.refreshToken(req.user);
  }
}
