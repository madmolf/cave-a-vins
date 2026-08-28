import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';

@Controller('api/user')
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  private extractTokenFromCookie(cookieHeader: string | undefined) {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map((p) => p.trim());
    const tokenPart = parts.find((p) => p.startsWith('token='));
    if (!tokenPart) return null;
    return tokenPart.replace('token=', '');
  }

  @Get('profile')
  getProfile(@Req() req: Request) {
    const token = this.extractTokenFromCookie(req.headers.cookie);
    if (!token) return { error: 'Unauthorized' };
    try {
      const data = this.authService.verifyToken(token);
      const userId = data.userId;
      const u = this.authService.getUserById(userId);
      if (!u) return { error: 'Not found' };
      return {
        userId: u.id,
        pseudo: u.pseudo || null,
        email: u.email,
        photo: u.photo || null,
      };
    } catch (e) {
      return { error: 'Unauthorized' };
    }
  }

  @Put('profile')
  updateProfile(@Body() body: any, @Req() req: Request) {
    const token = this.extractTokenFromCookie(req.headers.cookie);
    if (!token) return { error: 'Unauthorized' };
    try {
      const data = this.authService.verifyToken(token);
      const userId = data.userId;
      const u = this.authService.getUserById(userId);
      if (!u) return { error: 'Not found' };
      // update allowed fields
      u.pseudo = body.pseudo ?? u.pseudo;
      u.photo = body.photo ?? u.photo;
      u.bio = body.bio ?? u.bio;
      return { message: 'Profile updated' };
    } catch (e) {
      return { error: 'Unauthorized' };
    }
  }

  @Get('cave')
  getCave(@Req() req: Request) {
    const token = this.extractTokenFromCookie(req.headers.cookie);
    if (!token) return { error: 'Unauthorized' };
    try {
      const data = this.authService.verifyToken(token);
      const userId = data.userId;
      const u = this.authService.getUserById(userId);
      if (!u) return { error: 'Not found' };
      // return preferred wines (take first 3 if present)
      const preferred = (u.cave || []).slice(0, 3);
      return { PreferedWine: preferred };
    } catch (e) {
      return { error: 'Unauthorized' };
    }
  }
}
