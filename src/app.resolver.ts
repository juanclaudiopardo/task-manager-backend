// src/app.resolver.ts
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello, GraphQL with NestJS and Prisma!';
  }
}
