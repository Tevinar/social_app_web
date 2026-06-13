import {
  guardRemoteDataSourceCall,
  parseServerExceptionFromResponse,
} from '@/core/errors/exceptions-mapper';
import { EnvVariable } from '@/core/config/env-variable';
import { InvalidResponseException } from '@/core/errors/exceptions';
import { JsonReader } from '@/core/serialization/json-reader';

/**
 * Supported HTTP methods for the project-owned HTTP client.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request parameters shared by the HTTP client methods.
 */
export interface HttpRequestParams {
  /**
   * Relative request path to call.
   */
  path: string;

  /**
   * HTTP method to use for the request.
   */
  method: HttpMethod;

  /**
   * Optional JSON payload to serialize into the request body.
   */
  json?: unknown;

  /**
   * Optional additional headers to merge into the request.
   */
  headers?: HeadersInit;
}

/**
 * Dependency-injection token for `HttpClient`.
 */
export const HTTP_CLIENT = Symbol('HTTP_CLIENT');

/**
 * Thin project-owned HTTP abstraction used by remote data sources.
 */
export interface HttpClient {
  /**
   * Executes one request expected to return a JSON object.
   */
  requestJson(params: HttpRequestParams): Promise<Record<string, unknown>>;

  /**
   * Executes one request whose body is ignored.
   */
  requestVoid(params: HttpRequestParams): Promise<void>;
}

/**
 * `fetch`-backed implementation of `HttpClient`.
 *
 * This uses the global `fetch` implementation together with the configured API
 * base URL while centralizing common HTTP mechanics such as JSON
 * serialization and backend error parsing.
 */
export class FetchHttpClient implements HttpClient {
  private readonly basePath = requireApiBaseUrl();

  async requestJson(
    params: HttpRequestParams,
  ): Promise<Record<string, unknown>> {
    return guardRemoteDataSourceCall(async () => {
      const response = await fetch(
        this.buildRequestPath(params.path),
        this.buildRequestInit(params),
      );

      if (!response.ok) {
        throw await parseServerExceptionFromResponse(response);
      }

      return this.readJsonObjectResponse(response);
    });
  }

  async requestVoid(params: HttpRequestParams): Promise<void> {
    return guardRemoteDataSourceCall(async () => {
      const response = await fetch(
        this.buildRequestPath(params.path),
        this.buildRequestInit(params),
      );

      if (!response.ok) {
        throw await parseServerExceptionFromResponse(response);
      }
    });
  }

  /**
   * Builds the `fetch` request init object for one HTTP request.
   */
  private buildRequestInit(params: HttpRequestParams): RequestInit {
    const headers = new Headers(params.headers);

    if (params.json !== undefined && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const requestInit: RequestInit = {
      method: params.method,
      headers,
    };

    if (params.json !== undefined) {
      requestInit.body = JSON.stringify(params.json);
    }

    return requestInit;
  }

  /**
   * Builds the final backend request path from the configured API base URL and
   * one relative endpoint path.
   */
  private buildRequestPath(path: string): string {
    return `${trimTrailingSlash(this.basePath)}${ensureLeadingSlash(path)}`;
  }

  /**
   * Parses one successful JSON-object response body.
   */
  private async readJsonObjectResponse(
    response: Response,
  ): Promise<Record<string, unknown>> {
    let body: unknown;

    try {
      body = (await response.json()) as unknown;
    } catch {
      throw new InvalidResponseException({
        message: 'Response is not valid JSON',
      });
    }

    return JsonReader.asObject(body, 'response', 'Response payload');
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

function requireApiBaseUrl(): string {
  const apiBaseUrl = process.env[EnvVariable.ApiBaseUrl];
  if (!apiBaseUrl) {
    throw new Error(`${EnvVariable.ApiBaseUrl} is not configured`);
  }

  return apiBaseUrl;
}
