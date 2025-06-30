// src/tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, TaskStatus, Priority } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(createTaskInput: CreateTaskInput, user: User) {
    // Verificar que el usuario tiene acceso al proyecto
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: createTaskInput.projectId,
        },
      },
    });

    if (!projectMember) {
      throw new ForbiddenException('No access to this project');
    }

    // Verificar que el assignee (si existe) también tiene acceso al proyecto
    if (createTaskInput.assigneeId) {
      const assigneeMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: createTaskInput.assigneeId,
            projectId: createTaskInput.projectId,
          },
        },
      });

      if (!assigneeMember) {
        throw new ForbiddenException(
          'Assignee does not have access to this project',
        );
      }
    }

    return this.prisma.task.create({
      data: {
        title: createTaskInput.title,
        description: createTaskInput.description,
        projectId: createTaskInput.projectId,
        categoryId: createTaskInput.categoryId,
        assigneeId: createTaskInput.assigneeId,
        creatorId: user.id,
        priority: createTaskInput.priority || Priority.MEDIUM,
        dueDate: createTaskInput.dueDate,
        status: TaskStatus.TODO,
      },
    });
  }

  async getTasksByProject(projectId: string, userId: string) {
    // Verificar acceso al proyecto
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!projectMember) {
      throw new ForbiddenException('No access to this project');
    }

    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getMyTasks(userId: string) {
    // Obtener tareas asignadas al usuario de todos sus proyectos
    const userProjects = await this.prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = userProjects.map((p) => p.projectId);

    return this.prisma.task.findMany({
      where: {
        AND: [{ projectId: { in: projectIds } }, { assigneeId: userId }],
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verificar acceso al proyecto de la tarea
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: task.projectId,
        },
      },
    });

    if (!projectMember) {
      throw new ForbiddenException('No access to this task');
    }

    return task;
  }

  async updateTask(
    taskId: string,
    updateTaskInput: UpdateTaskInput,
    userId: string,
  ) {
    const task = await this.getTaskById(taskId, userId);

    // Verificar que el assignee (si se está cambiando) tiene acceso al proyecto
    if (updateTaskInput.assigneeId) {
      const assigneeMember = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: updateTaskInput.assigneeId,
            projectId: task.projectId,
          },
        },
      });

      if (!assigneeMember) {
        throw new ForbiddenException(
          'Assignee does not have access to this project',
        );
      }
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateTaskInput,
    });
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId, userId);

    // Solo el creador o miembros OWNER/ADMIN del proyecto pueden eliminar
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: task.projectId,
        },
      },
    });

    const canDelete =
      task.creatorId === userId ||
      projectMember?.role === 'OWNER' ||
      projectMember?.role === 'ADMIN';

    if (!canDelete) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this task',
      );
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true };
  }
}
