import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const myRegax = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(myRegax, {
    message:
      'Password too weak. It must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be between 8 to 20 characters long.',
  })
  password: string;
}
