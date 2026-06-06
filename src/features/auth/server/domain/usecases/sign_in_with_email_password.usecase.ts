import 'server-only';

import type { Failure } from '@/core/errors/failures';
import type { UseCase } from '@/core/use_case_intefaces';
import type { User } from '@/features/auth/neutral/domain/entities/user';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth_repository';
import { err, type Result } from 'neverthrow';
import { validateAuthEmailAndPassword } from './auth_input_validation';

/**
 * Input payload accepted by `SignInWithEmailPasswordUseCase`.
 */
export interface SignInWithEmailPasswordParams {
  /**
   * Email submitted by the user.
   */
  readonly email: string;

  /**
   * Password submitted by the user.
   */
  readonly password: string;
}

/**
 * Signs in one user from email/password credentials.
 */
export class SignInWithEmailPasswordUseCase implements UseCase<
  User,
  SignInWithEmailPasswordParams
> {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Validates input and delegates the sign-in command to the auth repository.
   */
  async execute(
    params: SignInWithEmailPasswordParams,
  ): Promise<Result<User, Failure>> {
    const email = params.email.trim();
    const validationFailure = validateAuthEmailAndPassword({
      email,
      password: params.password,
    });

    if (validationFailure) {
      return err(validationFailure);
    }

    return this.authRepository.signInWithEmailPassword({
      email,
      password: params.password,
    });
  }
}
