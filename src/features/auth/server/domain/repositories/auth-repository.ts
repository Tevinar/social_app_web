import 'server-only';

import type { Failure } from '@/core/errors/failures';
import type { User } from '@/features/auth/neutral/domain/entities/user';
import type { Result } from 'neverthrow';

/**
 * Coordinates backend auth requests with
 * local session and device persistence.
 */
export interface AuthRepository {
  /**
   * Registers a user from email/password credentials and returns the
   * authenticated user summary.
   */
  signUpWithEmailPassword(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<Result<User, Failure>>;

  /**
   * Authenticates a user from email/password credentials and returns the
   * authenticated user summary.
   */
  signInWithEmailPassword(params: {
    email: string;
    password: string;
  }): Promise<Result<User, Failure>>;

  /**
   * Returns the current authenticated user identifier, or `null` when no
   * authenticated session exists.
   */
  getCurrentUserId(): Promise<Result<string | null, Failure>>;

  /**
   * Signs out the current authenticated user.
   */
  signOut(): Promise<Result<void, Failure>>;
}
