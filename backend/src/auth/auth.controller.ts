import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    const { email, password } = body;
    return this.authService.register(email, password);
  }

  @Post('login')
  login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;
    const { userId, token } = this.authService.login(email, password);
    // set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return { userId, token };
  }
}
