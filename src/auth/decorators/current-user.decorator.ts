// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { Request } from 'express';

// Definir el tipo del contexto GraphQL
interface GraphQLContext {
  req: Request & { user?: User };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphQLContext>();

    const user = gqlContext.req.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    return user;
  },
);
