import 'server-only';

import { CommonFailureMessages } from '@/core/errors/failure-messages';
import type { Failure } from '@/core/errors/failures';
import { ValidationFailure } from '@/core/errors/failures';
import type { UseCase } from '@/core/use-case-intefaces';
import type { BlogRepository } from '@/features/blog/server/domain/repositories/blog-repository';
import type { BlogListSlice } from '@/features/blog/server/domain/read-models/blog-list-slice';
import { err, type Result } from 'neverthrow';

/**
 * Input payload accepted by `GetBlogListSliceUseCase`.
 */
export interface GetBlogListSliceParams {
  /**
   * Maximum number of blogs to return.
   */
  readonly limit: number;

  /**
   * Opaque cursor of the next slice to load.
   */
  readonly cursor?: string;
}

/**
 * Loads one cursor-based blog list slice as a one-shot request.
 */
export class GetBlogListSliceUseCase implements UseCase<
  BlogListSlice,
  GetBlogListSliceParams
> {
  constructor(private readonly blogRepository: BlogRepository) {}

  /**
   * Validates the requested slice size, then loads the list slice.
   */
  async execute(
    params: GetBlogListSliceParams,
  ): Promise<Result<BlogListSlice, Failure>> {
    if (params.limit <= 0) {
      return err(new ValidationFailure(CommonFailureMessages.invalidLimit));
    }

    return this.blogRepository.getBlogListSlice({
      limit: params.limit,
      ...(params.cursor === undefined ? {} : { cursor: params.cursor }),
    });
  }
}
