import type { BlogTopic } from '@/features/blog/server/domain/value-objects/blog-topic';

/**
 * Domain entity representing one blog post.
 */
export class Blog {
  constructor(params: {
    id: string;
    posterId: string;
    title: string;
    content: string;
    imageUrl: string;
    topics: ReadonlyArray<BlogTopic>;
    createdAt: Date;
    updatedAt: Date;
    posterName: string;
  }) {
    this.id = params.id;
    this.posterId = params.posterId;
    this.title = params.title;
    this.content = params.content;
    this.imageUrl = params.imageUrl;
    this.topics = params.topics;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.posterName = params.posterName;
  }

  /**
   * Unique blog identifier.
   */
  readonly id: string;

  /**
   * Identifier of the user who created the blog.
   */
  readonly posterId: string;

  /**
   * Blog title shown in lists and detail views.
   */
  readonly title: string;

  /**
   * Main text content of the blog post.
   */
  readonly content: string;

  /**
   * Public URL of the blog cover image.
   */
  readonly imageUrl: string;

  /**
   * Topics associated with the blog.
   */
  readonly topics: ReadonlyArray<BlogTopic>;

  /**
   * Creation date of the blog.
   */
  readonly createdAt: Date;

  /**
   * Last update date of the blog.
   */
  readonly updatedAt: Date;

  /**
   * Poster name resolved for display purposes.
   */
  readonly posterName: string;
}
