'use server';

import 'server-only';

import { createServerAuthRepository } from '@/features/auth/server/data/repositories/create_auth_repository';
import {
  SignInWithEmailPasswordUseCase,
  type SignInWithEmailPasswordParams,
} from '@/features/auth/server/domain/usecases/sign_in_with_email_password.usecase';
import { UserModel } from '../../neutral/data/models/user_model';

/**
 * Server Action that authenticates one user and returns a serializable user
 * snapshot for client-side consumption.
 */
export async function signIn(
  params: SignInWithEmailPasswordParams,
): Promise<UserModel> {
  const useCase = new SignInWithEmailPasswordUseCase(
    createServerAuthRepository(),
  );
  const result = await useCase.execute(params);

  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return UserModel.fromEntity(result.value);
}
