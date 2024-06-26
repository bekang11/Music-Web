import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CaptchaService } from './capcha/captchaservice';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Post('/signup')
  async signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Body('captcha') captcha: string,
  ): Promise<void> {
    const expectedCaptcha = this.captchaService.getExpectedCaptcha();
    const isCaptchaValid = captcha === expectedCaptcha;

    if (!isCaptchaValid) {
      throw new HttpException(
        'CAPTCHA validation failed',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  getProtectedResource() {
    return { message: 'This is a protected resource' };
  }
}
