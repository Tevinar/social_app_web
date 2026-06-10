import 'server-only';

import { JsonReader } from '@/core/serialization/json_reader';
import { AuthSessionModel } from './auth_session_model';
import { UserModel } from '@/features/auth/neutral/data/models/user-model';

/**
 * Data model returned by sign-in and sign-up endpoints.
 */
export class AuthenticatedUserModel {
  constructor(
    readonly session: AuthSessionModel,
    readonly user: UserModel,
  ) {}

  /**
   * Creates an `AuthenticatedUserModel` from one JSON object.
   */
  static fromJson(json: Record<string, unknown>): AuthenticatedUserModel {
    const user = UserModel.fromJson(
      JsonReader.readObject(json, 'user', 'Authenticated user payload'),
    );

    return new AuthenticatedUserModel(
      AuthSessionModel.fromJson(json, { userId: user.id }),
      user,
    );
  }
}
