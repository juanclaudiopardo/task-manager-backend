// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterInput, AuthPayload } from './dto/auth.dto'; // ← Agregar AuthPayload

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  login(user: User): AuthPayload {
    // ← Cambiar tipo de retorno
    const payload = { email: user.email, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.generateRefreshToken(user.id),
      user: {
        // ← Mapear a UserObject
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    // ← Agregar tipo de retorno
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerInput.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerInput.email,
        name: registerInput.name,
        password: hashedPassword,
      },
    });

    return this.login(user);
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }
}
