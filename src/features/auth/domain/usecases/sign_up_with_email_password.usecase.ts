import type { Failure } from '@/core/errors/failures';
import type { UseCase } from '@/core/use_case_intefaces';
import { err, type Result } from 'neverthrow';
import type { User } from '../entities/user';
import type { AuthRepository } from '../repositories/auth_repository';
import {
  validateAuthEmailAndPassword,
  validateAuthName,
} from './auth_input_validation';

/**
 * Input payload accepted by `SignUpWithEmailPasswordUseCase`.
 */
export interface SignUpWithEmailPasswordParams {
  /**
   * Display name submitted by the user.
   */
  readonly name: string;

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
 * Signs up one user from email/password credentials.
 */
export class SignUpWithEmailPasswordUseCase implements UseCase<
  User,
  SignUpWithEmailPasswordParams
> {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Validates input and delegates the sign-up command to the auth repository.
   */
  async execute(
    params: SignUpWithEmailPasswordParams,
  ): Promise<Result<User, Failure>> {
    const email = params.email.trim();
    const credentialsFailure = validateAuthEmailAndPassword({
      email,
      password: params.password,
    });

    if (credentialsFailure) {
      return err(credentialsFailure);
    }

    const nameFailure = validateAuthName(params.name);
    if (nameFailure) {
      return err(nameFailure);
    }

    return this.authRepository.signUpWithEmailPassword({
      name: params.name,
      email,
      password: params.password,
    });
  }
}
