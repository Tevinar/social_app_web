import 'server-only';

import type { Blog } from '@/features/blog/server/domain/entities/blog';

/**
 * One cursor-based slice of blog results.
 */
export class BlogListSlice {
  constructor(params: {
    blogs: ReadonlyArray<Blog>;
    nextCursor: string | null;
  }) {
    this.blogs = params.blogs;
    this.nextCursor = params.nextCursor;
  }

  /**
   * Blogs returned for the requested slice.
   */
  readonly blogs: ReadonlyArray<Blog>;

  /**
   * Opaque cursor used to request the next slice, when available.
   */
  readonly nextCursor: string | null;
}
