import 'server-only';

import { JsonReader } from '@/core/serialization/json-reader';
import { BlogListSlice } from '@/features/blog/server/domain/read-models/blog-list-slice';
import { BlogModel } from './blog-model';

/**
 * Data-layer representation of one cursor-based blog list slice.
 */
export class BlogListSliceModel {
  constructor(
    readonly items: ReadonlyArray<BlogModel>,
    readonly nextCursor: string | null,
  ) {}

  /**
   * Builds a blog list slice model from a backend JSON payload.
   */
  static fromJson(json: Record<string, unknown>): BlogListSliceModel {
    const items = JsonReader.readList(json, 'items', 'Blog list slice payload');

    return new BlogListSliceModel(
      items.map((item) =>
        BlogModel.fromJson(
          JsonReader.asObject(item, 'items[]', 'Blog list slice payload'),
        ),
      ),
      JsonReader.readNullableString(
        json,
        'nextCursor',
        'Blog list slice payload',
      ),
    );
  }

  /**
   * Converts the model into the domain blog-list slice.
   */
  toReadModel(): BlogListSlice {
    return new BlogListSlice({
      blogs: this.items.map((item) => item.toEntity()),
      nextCursor: this.nextCursor,
    });
  }
}
