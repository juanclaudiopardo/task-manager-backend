// src/projects/dto/project.dto.ts
import {
  InputType,
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ProjectRole } from '@prisma/client';

// Registrar enum para GraphQL
registerEnumType(ProjectRole, {
  name: 'ProjectRole',
});

@InputType()
export class CreateProjectInput {
  @Field()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;
}

@InputType()
export class UpdateProjectInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;
}

@ObjectType()
export class ProjectObject {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  color: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ProjectRole)
  userRole: ProjectRole; // Rol del usuario actual en este proyecto
}
