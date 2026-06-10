import {
  InvalidResponseException,
  NetworkException,
  ServerException,
  UnauthorizedException,
  UnexpectedException,
} from './exceptions';
import { JsonReader } from '@/core/serialization/json-reader';

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
  const json = JsonReader.asObject(data, 'response', 'Backend error response');

  const message = JsonReader.readString(
    json,
    'message',
    'Backend error response',
  );
  const code = JsonReader.readString(json, 'code', 'Backend error response');
  const statusCode = JsonReader.readInt(
    json,
    'statusCode',
    'Backend error response',
  );
  const path = JsonReader.readString(json, 'path', 'Backend error response');
  const timestamp = JsonReader.readDateTime(
    json,
    'timestamp',
    'Backend error response',
  );

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
