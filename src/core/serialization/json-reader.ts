import { InvalidResponseException } from '@/core/errors/exceptions';

/**
 * Typed helpers for reading validated values from decoded JSON objects.
 */
export class JsonReader {
  /**
   * Prevents instantiation of this static utility class.
   */
  private constructor() {}

  /**
   * Reads a required string field from `json`.
   *
   * Throws `InvalidResponseException` when `field` is missing or is not a
   * non-empty string.
   */
  static readString(
    json: Record<string, unknown>,
    field: string,
    source = 'JSON payload',
  ): string {
    const value = json[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }

    throw new InvalidResponseException({
      message: `${source} has invalid "${field}" field`,
    });
  }

  /**
   * Reads a required object field from `json`.
   *
   * Throws `InvalidResponseException` when `field` is missing or is not a JSON
   * object.
   */
  static readObject(
    json: Record<string, unknown>,
    field: string,
    source = 'JSON payload',
  ): Record<string, unknown> {
    return JsonReader.asObject(json[field], field, source);
  }

  /**
   * Converts `value` to a JSON object map.
   *
   * Throws `InvalidResponseException` when `value` is not a JSON object.
   */
  static asObject(
    value: unknown,
    field: string,
    source = 'JSON payload',
  ): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new InvalidResponseException({
        message: `${source} has invalid "${field}" field`,
      });
    }

    return value as Record<string, unknown>;
  }

  /**
   * Reads a required integer-like field from `json`.
   *
   * Throws `InvalidResponseException` when `field` is missing or is not a
   * finite number.
   */
  static readInt(
    json: Record<string, unknown>,
    field: string,
    source = 'JSON payload',
  ): number {
    const value = json[field];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.trunc(value);
    }

    throw new InvalidResponseException({
      message: `${source} has invalid "${field}" field`,
    });
  }

  /**
   * Reads a required ISO-8601 date-time field from `json`.
   *
   * Throws `InvalidResponseException` when `field` is missing, is not a
   * string, or cannot be parsed into a valid date.
   */
  static readDateTime(
    json: Record<string, unknown>,
    field: string,
    source = 'JSON payload',
  ): Date {
    const value = json[field];
    if (typeof value !== 'string') {
      throw new InvalidResponseException({
        message: `${source} has invalid "${field}" field`,
      });
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new InvalidResponseException({
        message: `${source} has invalid "${field}" field`,
      });
    }

    return date;
  }
}
