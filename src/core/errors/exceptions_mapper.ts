import {
  InvalidResponseException,
  NetworkException,
  ServerException,
  UnauthorizedException,
  UnexpectedException,
} from './exceptions';

/**
 * Runs one remote data source operation behind a consistent exception
 * boundary.
 */
export async function guardRemoteDataSourceCall<T>(
  call: () => Promise<T>,
): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (
      error instanceof InvalidResponseException ||
      error instanceof NetworkException ||
      error instanceof ServerException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new InvalidResponseException({ message: error.message });
    }

    if (isNetworkError(error)) {
      throw new NetworkException({
        message: error.message || 'Network request failed',
      });
    }

    if (error instanceof Error) {
      throw new UnexpectedException({ message: error.message });
    }

    throw new UnexpectedException({ message: String(error) });
  }
}

/**
 * Parses a backend error response into a fully populated `ServerException`.
 */
export async function parseServerExceptionFromResponse(
  response: Response,
): Promise<ServerException> {
  const body = await response.text();
  if (!body) {
    throw new InvalidResponseException({
      message: 'Backend error response body is empty',
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(body) as unknown;
  } catch {
    throw new InvalidResponseException({
      message: 'Backend error response is not a valid JSON object',
    });
  }

  return parseServerExceptionPayload(data);
}

/**
 * Parses a backend error payload into a fully populated `ServerException`.
 */
export function parseServerExceptionPayload(data: unknown): ServerException {
  const json = asJsonObject(data);
  if (!json) {
    throw new InvalidResponseException({
      message: 'Backend error response is not a valid JSON object',
    });
  }

  const message = requireString(json, 'message');
  const code = requireString(json, 'code');
  const statusCode = requireInt(json, 'statusCode');
  const path = requireString(json, 'path');
  const timestamp = requireTimestamp(json, 'timestamp');

  return new ServerException({
    message,
    code,
    statusCode,
    path,
    timestamp,
  });
}

function isNetworkError(error: unknown): error is Error {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  return error instanceof TypeError;
}

function asJsonObject(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return null;
  }

  return data as Record<string, unknown>;
}

function requireString(json: Record<string, unknown>, field: string): string {
  const value = json[field];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  throw new InvalidResponseException({
    message: `Backend error response has invalid "${field}" field`,
  });
}

function requireInt(json: Record<string, unknown>, field: string): number {
  const value = json[field];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  throw new InvalidResponseException({
    message: `Backend error response has invalid "${field}" field`,
  });
}

function requireTimestamp(json: Record<string, unknown>, field: string): Date {
  const value = json[field];
  if (typeof value !== 'string') {
    throw new InvalidResponseException({
      message: `Backend error response has invalid "${field}" field`,
    });
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    throw new InvalidResponseException({
      message: `Backend error response has invalid "${field}" field`,
    });
  }

  return timestamp;
}
