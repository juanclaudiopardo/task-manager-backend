// src/auth/dto/auth.dto.ts
import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

// ← MOVER UserObject ANTES de AuthPayload
@ObjectType()
export class UserObject {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ← AuthPayload DESPUÉS de UserObject
@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserObject)
  user: UserObject;
}
