import 'server-only';

import { err, ok, type Result } from 'neverthrow';
import { mapExceptionToFailure } from '@/core/errors/failures-mapper';
import { UnexpectedFailure, type Failure } from '@/core/errors/failures';
import type { PinoAppLogger } from '@/core/server-logging/pino-app-logger';
import type { BlogRepository } from '@/features/blog/server/domain/repositories/blog-repository';
import type { BlogTopic } from '@/features/blog/server/domain/value-objects/blog-topic';
import type { Blog } from '@/features/blog/server/domain/entities/blog';
import type { BlogListSlice } from '@/features/blog/server/domain/read-models/blog-list-slice';
import type { BlogRemoteDataSource } from '@/features/blog/server/data/sources/blog-remote-data-source';

/**
 * Concrete `BlogRepository` that coordinates backend blog requests.
 */
export class BlogRepositoryImpl implements BlogRepository {
  constructor(
    private readonly blogRemoteDataSource: BlogRemoteDataSource,
    private readonly appLogger: PinoAppLogger,
  ) {}

  async createBlog(params: {
    image: File;
    title: string;
    content: string;
    topics: ReadonlyArray<BlogTopic>;
  }): Promise<Result<Blog, Failure>> {
    try {
      const blog = await this.blogRemoteDataSource.createBlog({
        title: params.title,
        content: params.content,
        image: params.image,
        topics: params.topics,
      });

      return ok(blog.toEntity());
    } catch (error) {
      const failure = mapExceptionToFailure(error);

      if (failure instanceof UnexpectedFailure) {
        this.appLogger.error('Create blog failed unexpectedly', error);
      }

      return err(failure);
    }
  }

  async getBlogListSlice(params: {
    limit: number;
    cursor?: string;
  }): Promise<Result<BlogListSlice, Failure>> {
    try {
      const slice = await this.blogRemoteDataSource.getBlogListSlice({
        limit: params.limit,
        ...(params.cursor === undefined ? {} : { cursor: params.cursor }),
      });

      return ok(slice.toReadModel());
    } catch (error) {
      const failure = mapExceptionToFailure(error);

      if (failure instanceof UnexpectedFailure) {
        this.appLogger.error('Get blog list slice failed unexpectedly', error);
      }

      return err(failure);
    }
  }
}
