'use server';

import 'server-only';

import { createServerAuthRepository } from '@/features/auth/server/data/repositories/create_auth_repository';
import {
  SignUpWithEmailPasswordUseCase,
  type SignUpWithEmailPasswordParams,
} from '@/features/auth/server/domain/usecases/sign-up-with-email-password.usecase';
import { UserModel } from '../../neutral/data/models/user-model';

/**
 * Server Action that registers one user and returns a serializable user
 * snapshot for client-side consumption.
 */
export async function signUp(
  params: SignUpWithEmailPasswordParams,
): Promise<UserModel> {
  const useCase = new SignUpWithEmailPasswordUseCase(
    createServerAuthRepository(),
  );
  const result = await useCase.execute(params);

  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return UserModel.fromEntity(result.value);
}
