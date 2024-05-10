import { Injectable } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  private expectedCaptcha: string;

  setExpectedCaptcha(captcha: string): void {
    this.expectedCaptcha = captcha;
  }

  getExpectedCaptcha(): string {
    return this.expectedCaptcha;
  }
}
