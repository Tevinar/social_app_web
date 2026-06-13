import 'server-only';

import type { Failure } from '@/core/errors/failures';
import type { Blog } from '@/features/blog/server/domain/entities/blog';
import type { BlogListSlice } from '@/features/blog/server/domain/read-models/blog-list-slice';
import type { BlogTopic } from '@/features/blog/server/domain/value-objects/blog-topic';
import type { Result } from 'neverthrow';

/**
 * Dependency-injection token for `BlogRepository`.
 */
export const BLOG_REPOSITORY = Symbol('BLOG_REPOSITORY');

/**
 * Domain contract for blog creation and blog-list pagination.
 */
export interface BlogRepository {
  /**
   * Creates one blog from the submitted payload.
   */
  createBlog(params: {
    image: File;
    title: string;
    content: string;
    topics: ReadonlyArray<BlogTopic>;
  }): Promise<Result<Blog, Failure>>;

  /**
   * Loads one cursor-based blog list slice.
   */
  getBlogListSlice(params: {
    limit: number;
    cursor?: string;
  }): Promise<Result<BlogListSlice, Failure>>;
}
