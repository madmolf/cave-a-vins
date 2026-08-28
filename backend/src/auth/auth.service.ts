import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

interface UserRecord {
  id: number;
  email: string;
  passwordHash: string; // salt:hash
  pseudo?: string;
  photo?: string;
  bio?: string;
  cave?: string[];
}

@Injectable()
export class AuthService {
  private users: UserRecord[] = [];
  private idCounter = 1;
  private readonly SECRET = 'dev-secret-change-me';

  private hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(':');
    const attempted = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(attempted, 'hex'),
    );
  }

  register(email: string, password: string) {
    if (this.users.find((u) => u.email === email)) {
      throw new Error('Email already exists');
    }
    const passwordHash = this.hashPassword(password);
    const user: UserRecord = {
      id: this.idCounter++,
      email,
      passwordHash,
      cave: [],
      bio: '',
    };
    this.users.push(user);
    return { message: 'User created' };
  }

  login(email: string, password: string) {
    const user = this.users.find((u) => u.email === email);
    if (!user) throw new UnauthorizedException();
    if (!this.verifyPassword(password, user.passwordHash))
      throw new UnauthorizedException();
    const token = this.generateToken({ userId: user.id });
    return { userId: user.id, token };
  }

  private generateToken(payload: Record<string, any>) {
    const data = { ...payload, iat: Date.now() };
    const str = JSON.stringify(data);
    const sig = crypto
      .createHmac('sha256', this.SECRET)
      .update(str)
      .digest('hex');
    return Buffer.from(str).toString('base64') + '.' + sig;
  }

  verifyToken(token: string) {
    try {
      const [b64, sig] = token.split('.');
      const str = Buffer.from(b64, 'base64').toString('utf8');
      const expected = crypto
        .createHmac('sha256', this.SECRET)
        .update(str)
        .digest('hex');
      if (
        !crypto.timingSafeEqual(
          Buffer.from(sig, 'hex'),
          Buffer.from(expected, 'hex'),
        )
      )
        throw new Error('bad sig');
      const data = JSON.parse(str);
      return data;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  getUserById(id: number) {
    return this.users.find((u) => u.id === id);
  }
}
