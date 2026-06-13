import 'server-only';

import { BlogFailureMessages } from '@/core/errors/failure-messages';
import type { Failure } from '@/core/errors/failures';
import { ValidationFailure } from '@/core/errors/failures';
import type { UseCase } from '@/core/use-case-intefaces';
import type { Blog } from '@/features/blog/server/domain/entities/blog';
import type { BlogRepository } from '@/features/blog/server/domain/repositories/blog-repository';
import type { BlogTopic } from '@/features/blog/server/domain/value-objects/blog-topic';
import { err, type Result } from 'neverthrow';

/**
 * Input payload accepted by `CreateBlogUseCase`.
 */
export interface CreateBlogParams {
  /**
   * Blog title.
   */
  readonly title: string;

  /**
   * Blog content body.
   */
  readonly content: string;

  /**
   * Selected cover image file.
   */
  readonly image: File;

  /**
   * Selected topics attached to the blog.
   */
  readonly topics: ReadonlyArray<BlogTopic>;
}

/**
 * Validates blog input and delegates blog creation to the repository.
 */
export class CreateBlogUseCase implements UseCase<Blog, CreateBlogParams> {
  constructor(private readonly blogRepository: BlogRepository) {}

  /**
   * Validates the request, then creates the blog if the data is valid.
   */
  async execute(params: CreateBlogParams): Promise<Result<Blog, Failure>> {
    if (params.image.size <= 0) {
      return err(new ValidationFailure(BlogFailureMessages.imageRequired));
    }

    if (params.title.length === 0) {
      return err(new ValidationFailure(BlogFailureMessages.titleRequired));
    }

    if (params.content.length === 0) {
      return err(new ValidationFailure(BlogFailureMessages.contentRequired));
    }

    if (params.topics.length === 0) {
      return err(
        new ValidationFailure(BlogFailureMessages.topicSelectionRequired),
      );
    }

    return this.blogRepository.createBlog({
      image: params.image,
      title: params.title,
      content: params.content,
      topics: params.topics,
    });
  }
}
