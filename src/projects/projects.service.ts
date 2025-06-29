// src/projects/projects.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, ProjectRole } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(createProjectInput: CreateProjectInput, user: User) {
    // Crear proyecto y automáticamente hacer al usuario OWNER
    const project = await this.prisma.project.create({
      data: {
        name: createProjectInput.name,
        description: createProjectInput.description,
        color: createProjectInput.color || '#6366f1',
        members: {
          create: {
            userId: user.id,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
    });

    return {
      ...project,
      userRole: project.members[0].role,
    };
  }

  async getProjectsByUser(userId: string) {
    const projectMembers = await this.prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: true,
      },
      orderBy: {
        project: { updatedAt: 'desc' },
      },
    });

    return projectMembers.map((member) => ({
      ...member.project,
      userRole: member.role,
    }));
  }

  async getProjectById(projectId: string, userId: string) {
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      include: {
        project: true,
      },
    });

    if (!projectMember) {
      throw new NotFoundException('Project not found or access denied');
    }

    return {
      ...projectMember.project,
      userRole: projectMember.role,
    };
  }

  async updateProject(
    projectId: string,
    updateProjectInput: UpdateProjectInput,
    userId: string,
  ) {
    // Verificar que el usuario tiene permisos (OWNER o ADMIN)
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (
      !member ||
      (member.role !== ProjectRole.OWNER && member.role !== ProjectRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to update project',
      );
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: updateProjectInput,
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    return {
      ...updatedProject,
      userRole: updatedProject.members[0].role,
    };
  }

  async deleteProject(projectId: string, userId: string) {
    // Solo el OWNER puede eliminar el proyecto
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member || member.role !== ProjectRole.OWNER) {
      throw new ForbiddenException('Only project owner can delete the project');
    }

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { success: true };
  }
}
