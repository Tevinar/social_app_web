import 'server-only';

import type { Failure } from '@/core/errors/failures';
import type { NoParamsUseCase } from '@/core/use-case-intefaces';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import type { Result } from 'neverthrow';

/**
 * Returns the current authenticated user identifier.
 */
export class GetCurrentUserIdUseCase implements NoParamsUseCase<string | null> {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Delegates current-user-id lookup to the auth repository.
   */
  execute(): Promise<Result<string | null, Failure>> {
    return this.authRepository.getCurrentUserId();
  }
}
