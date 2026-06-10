import 'server-only';

import type { Failure } from '@/core/errors/failures';
import type { NoParamsUseCase } from '@/core/use-case-intefaces';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import type { Result } from 'neverthrow';

/**
 * Signs out the current authenticated user.
 */
export class SignOutCurrentUserUseCase implements NoParamsUseCase<void> {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Delegates the sign-out command to the auth repository.
   */
  execute(): Promise<Result<void, Failure>> {
    return this.authRepository.signOut();
  }
}
