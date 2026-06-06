import 'server-only';

import type { Failure } from '@/core/errors/failures';
import type { NoParamsUseCase } from '@/core/use_case_intefaces';
import type { Result } from 'neverthrow';

/**
 * App-level shell service for current-session operations needed by multiple
 * features.
 */
export class SessionService {
  constructor(
    private readonly getCurrentUserIdUseCase: NoParamsUseCase<string | null>,
    private readonly signOutCurrentUserUseCase: NoParamsUseCase<void>,
  ) {}

  /**
   * Returns the current authenticated user identifier stored in the encrypted
   * auth-session cookie.
   */
  getCurrentUserId(): Promise<Result<string | null, Failure>> {
    return this.getCurrentUserIdUseCase.execute();
  }

  /**
   * Signs out the current authenticated user through the server auth use case.
   */
  signOut(): Promise<Result<void, Failure>> {
    return this.signOutCurrentUserUseCase.execute();
  }
}
