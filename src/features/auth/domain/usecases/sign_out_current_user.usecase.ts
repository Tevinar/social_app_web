import type { Failure } from '@/core/errors/failures';
import type { NoParamsUseCase } from '@/core/use_case_intefaces';
import type { Result } from 'neverthrow';
import type { AuthRepository } from '../repositories/auth_repository';

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
