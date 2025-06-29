// src/projects/projects.resolver.ts
import { UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectObject,
} from './dto/project.dto';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';

@ObjectType()
class DeleteProjectResponse {
  @Field()
  success: boolean;
}

@Resolver(() => ProjectObject)
export class ProjectsResolver {
  constructor(private projectsService: ProjectsService) {}

  @Mutation(() => ProjectObject)
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Args('input') createProjectInput: CreateProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.createProject(createProjectInput, user);
  }

  @Query(() => [ProjectObject])
  @UseGuards(JwtAuthGuard)
  async myProjects(@CurrentUser() user: User) {
    return this.projectsService.getProjectsByUser(user.id);
  }

  @Query(() => ProjectObject)
  @UseGuards(JwtAuthGuard)
  async project(@Args('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.getProjectById(id, user.id);
  }

  @Mutation(() => ProjectObject)
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Args('id') id: string,
    @Args('input') updateProjectInput: UpdateProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.updateProject(id, updateProjectInput, user.id);
  }

  @Mutation(() => DeleteProjectResponse)
  @UseGuards(JwtAuthGuard)
  async deleteProject(@Args('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.deleteProject(id, user.id);
  }
}
