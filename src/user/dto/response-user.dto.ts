import { User } from '../entities/user.entity';

export class ResponseUserDto {
  static buildResponse(user: User, token: string) {
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }
}
