import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
