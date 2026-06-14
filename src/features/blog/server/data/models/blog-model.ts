import 'server-only';

import { InvalidResponseException } from '@/core/errors/exceptions';
import { JsonReader } from '@/core/serialization/json-reader';
import { Blog } from '@/features/blog/server/domain/entities/blog';
import {
  fromValue,
  type BlogTopic,
} from '@/features/blog/server/domain/value-objects/blog-topic';

/**
 * Data-layer representation of one blog payload returned by the backend.
 */
export class BlogModel {
  constructor(
    readonly id: string,
    readonly posterId: string,
    readonly posterName: string,
    readonly title: string,
    readonly content: string,
    readonly imageUrl: string,
    readonly topics: ReadonlyArray<BlogTopic>,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  /**
   * Builds a `BlogModel` from a backend JSON payload.
   */
  static fromJson(json: Record<string, unknown>): BlogModel {
    const poster = JsonReader.readObject(json, 'poster', 'Blog payload');

    return new BlogModel(
      JsonReader.readString(json, 'id', 'Blog payload'),
      JsonReader.readString(poster, 'id', 'Blog poster payload'),
      JsonReader.readString(poster, 'name', 'Blog poster payload'),
      JsonReader.readString(json, 'title', 'Blog payload'),
      JsonReader.readString(json, 'content', 'Blog payload'),
      JsonReader.readString(json, 'imageUrl', 'Blog payload'),
      BlogModel.readTopics(json),
      JsonReader.readDateTime(json, 'createdAt', 'Blog payload'),
      JsonReader.readDateTime(json, 'updatedAt', 'Blog payload'),
    );
  }

  /**
   * Converts the data model into the domain `Blog` entity.
   */
  toEntity(): Blog {
    return new Blog({
      id: this.id,
      posterId: this.posterId,
      posterName: this.posterName,
      title: this.title,
      content: this.content,
      imageUrl: this.imageUrl,
      topics: this.topics,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  private static readTopics(
    json: Record<string, unknown>,
  ): ReadonlyArray<BlogTopic> {
    return JsonReader.readStringList(json, 'topics', 'Blog payload').map(
      (topic) => {
        try {
          return fromValue(topic);
        } catch {
          throw new InvalidResponseException({
            message: 'Blog payload has invalid "topics" field',
          });
        }
      },
    );
  }
}
