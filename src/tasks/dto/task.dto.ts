// src/tasks/dto/task.dto.ts
import {
  InputType,
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { TaskStatus, Priority } from '@prisma/client';

// Registrar enums para GraphQL
registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

registerEnumType(Priority, {
  name: 'Priority',
});

@InputType()
export class CreateTaskInput {
  @Field()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field()
  @IsNotEmpty()
  projectId: string;

  @Field({ nullable: true })
  @IsOptional()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  assigneeId?: string;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  dueDate?: Date;
}

@InputType()
export class UpdateTaskInput {
  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  assigneeId?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  dueDate?: Date;
}

@ObjectType()
export class TaskObject {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relaciones
  @Field()
  projectId: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  assigneeId?: string;

  @Field()
  creatorId: string;
}
