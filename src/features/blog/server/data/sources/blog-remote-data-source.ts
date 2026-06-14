import 'server-only';

import type { AxiosInstance } from 'axios';
import { JsonReader } from '@/core/serialization/json-reader';
import { BlogListSliceModel } from '@/features/blog/server/data/models/blog-list-slice-model';
import { BlogModel } from '@/features/blog/server/data/models/blog-model';

/**
 * Dependency-injection token for `BlogRemoteDataSource`.
 */
export const BLOG_REMOTE_DATA_SOURCE = Symbol('BLOG_REMOTE_DATA_SOURCE');

/**
 * Remote boundary for direct backend blog requests.
 */
export interface BlogRemoteDataSource {
  /**
   * Creates a new blog remotely and returns the persisted payload.
   */
  createBlog(params: {
    title: string;
    content: string;
    image: File;
    topics: ReadonlyArray<string>;
  }): Promise<BlogModel>;

  /**
   * Fetches one cursor-based slice of the remote blog list.
   */
  getBlogListSlice(params: {
    limit: number;
    cursor?: string;
  }): Promise<BlogListSliceModel>;
}

/**
 * Backend-facing implementation of `BlogRemoteDataSource`.
 */
export class BlogRemoteDataSourceImpl implements BlogRemoteDataSource {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async createBlog(params: {
    title: string;
    content: string;
    image: File;
    topics: ReadonlyArray<string>;
  }): Promise<BlogModel> {
    // Once image is part of the request, FormData is the standard
    // choice in axios to send multipart/form-data requests.
    const formData = new FormData();
    formData.set('title', params.title);
    formData.set('content', params.content);
    formData.set('image', params.image);

    for (const topic of params.topics) {
      formData.append('topics', topic);
    }

    const response = await this.axiosInstance.post('/blogs', formData);
    const body = JsonReader.asObject(
      response.data,
      'response',
      'Response payload',
    );

    return BlogModel.fromJson(body);
  }

  async getBlogListSlice(params: {
    limit: number;
    cursor?: string;
  }): Promise<BlogListSliceModel> {
    const searchParams = new URLSearchParams({
      limit: String(params.limit),
    });

    if (params.cursor !== undefined) {
      searchParams.set('cursor', params.cursor);
    }

    const response = await this.axiosInstance.get(
      `/blogs?${searchParams.toString()}`,
    );
    const body = JsonReader.asObject(
      response.data,
      'response',
      'Response payload',
    );

    return BlogListSliceModel.fromJson(body);
  }
}
