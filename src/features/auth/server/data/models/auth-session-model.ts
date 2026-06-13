import 'server-only';

import { JsonReader } from '@/core/serialization/json-reader';

/**
 * Data model representing a locally persisted authenticated token session.
 */
export class AuthSessionModel {
  constructor(
    readonly userId: string,
    readonly accessToken: string,
    readonly refreshToken: string,
    readonly accessTokenExpiresAt: Date,
    readonly refreshTokenExpiresAt: Date,
  ) {}

  /**
   * Creates an `AuthSessionModel` from one JSON object.
   */
  static fromJson(
    json: Record<string, unknown>,
    options?: { userId?: string },
  ): AuthSessionModel {
    return new AuthSessionModel(
      options?.userId ??
        JsonReader.readString(json, 'userId', 'Auth session payload'),
      JsonReader.readString(json, 'accessToken', 'Auth session payload'),
      JsonReader.readString(json, 'refreshToken', 'Auth session payload'),
      JsonReader.readDateTime(
        json,
        'accessTokenExpiresAt',
        'Auth session payload',
      ),
      JsonReader.readDateTime(
        json,
        'refreshTokenExpiresAt',
        'Auth session payload',
      ),
    );
  }

  /**
   * Converts the model to a serializable JSON object.
   */
  toJson(): Record<string, string> {
    return {
      userId: this.userId,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      accessTokenExpiresAt: this.accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: this.refreshTokenExpiresAt.toISOString(),
    };
  }
}
