// src/tasks/tasks.resolver.ts
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput, TaskObject } from './dto/task.dto';

@ObjectType()
class DeleteTaskResponse {
  @Field()
  success: boolean;
}

@Resolver(() => TaskObject)
export class TasksResolver {
  constructor(private tasksService: TasksService) {}

  @Mutation(() => TaskObject)
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Args('input') createTaskInput: CreateTaskInput,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.createTask(createTaskInput, user);
  }

  @Query(() => [TaskObject])
  @UseGuards(JwtAuthGuard)
  async tasksByProject(
    @Args('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.getTasksByProject(projectId, user.id);
  }

  @Query(() => [TaskObject])
  @UseGuards(JwtAuthGuard)
  async myTasks(@CurrentUser() user: User) {
    return this.tasksService.getMyTasks(user.id);
  }

  @Query(() => TaskObject)
  @UseGuards(JwtAuthGuard)
  async task(@Args('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.getTaskById(id, user.id);
  }

  @Mutation(() => TaskObject)
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Args('id') id: string,
    @Args('input') updateTaskInput: UpdateTaskInput,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.updateTask(id, updateTaskInput, user.id);
  }

  @Mutation(() => DeleteTaskResponse)
  @UseGuards(JwtAuthGuard)
  async deleteTask(@Args('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.deleteTask(id, user.id);
  }
}
