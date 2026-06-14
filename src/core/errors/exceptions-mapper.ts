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
    throw normalizeUnknownException(error);
  }
}

/**
 * Normalizes one unknown thrown value into the app's exception set.
 *
 * Existing app exceptions are preserved. Unknown values are mapped into
 * `InvalidResponseException`, `NetworkException`, or `UnexpectedException`.
 */
export function normalizeUnknownException(error: unknown): Error {
  if (
    error instanceof InvalidResponseException ||
    error instanceof NetworkException ||
    error instanceof ServerException ||
    error instanceof UnauthorizedException
  ) {
    return error;
  }

  if (error instanceof SyntaxError) {
    return new InvalidResponseException({ message: error.message });
  }

  if (isNetworkError(error)) {
    return new NetworkException({
      message: error.message || 'Network request failed',
    });
  }

  if (error instanceof Error) {
    return new UnexpectedException({ message: error.message });
  }

  return new UnexpectedException({ message: String(error) });
}

function isNetworkError(error: unknown): error is Error {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  return error instanceof TypeError;
}

/**
 * Parses one backend error response body into a fully populated
 * `ServerException`.
 *
 * The input may already be decoded JSON data or a raw JSON string.
 */
export function parseServerExceptionResponseData(
  data: unknown,
): ServerException {
  if (typeof data === 'string') {
    if (data.length === 0) {
      throw new InvalidResponseException({
        message: 'Backend error response body is empty',
      });
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(data) as unknown;
    } catch {
      throw new InvalidResponseException({
        message: 'Backend error response is not a valid JSON object',
      });
    }

    return parseServerExceptionPayload(parsedData);
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
