import type { Failure } from '@/core/errors/failures';
import type { Result } from 'neverthrow';
import type { User } from '../entities/user';

/**
 * Auth feature contract exposed to domain use cases.
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
   * Signs out the current authenticated user.
   */
  signOut(): Promise<Result<void, Failure>>;
}
