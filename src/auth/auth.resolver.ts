// src/auth/auth.resolver.ts
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginInput,
  RegisterInput,
  AuthPayload,
  UserObject,
} from './dto/auth.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator'; // ← NUEVO

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('input') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Query(() => UserObject)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): UserObject {
    // ← MUCHO MÁS LIMPIO
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
