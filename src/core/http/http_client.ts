import {
  guardRemoteDataSourceCall,
  parseServerExceptionFromResponse,
} from '@/core/errors/exceptions_mapper';
import { InvalidResponseException } from '@/core/errors/exceptions';
import { JsonReader } from '@/core/serialization/json_reader';

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

type FetchLike = typeof fetch;

/**
 * `fetch`-backed implementation of `HttpClient`.
 *
 * This keeps the app aligned with Next.js' native fetch model while
 * centralizing common HTTP mechanics such as JSON serialization and backend
 * error parsing.
 */
export class FetchHttpClient implements HttpClient {
  /**
   * Creates a `FetchHttpClient`.
   *
   * `fetchFn` allows the client to reuse the native `fetch` implementation by
   * default while still supporting injection in tests or specialized wrappers.
   * `basePath` defines the same-origin Next.js API prefix prepended to relative
   * feature paths such as `/auth/sign-in`.
   */
  constructor(
    private readonly fetchFn: FetchLike = fetch,
    private readonly basePath = '/api',
  ) {}

  async requestJson(
    params: HttpRequestParams,
  ): Promise<Record<string, unknown>> {
    return guardRemoteDataSourceCall(async () => {
      const response = await this.fetchFn(
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
      const response = await this.fetchFn(
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
   * Builds the final same-origin request path from the configured base path
   * and one relative endpoint path.
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
