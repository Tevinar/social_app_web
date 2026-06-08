'use server';

import 'server-only';

import { createServerAuthRepository } from '@/features/auth/server/data/repositories/create_auth_repository';
import { SignInWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-in-with-email-password.usecase';

/**
 * Serializable UI state returned by the sign-in Server Action.
 */
export type SignInActionState = {
  readonly status: 'idle' | 'success' | 'error';
  readonly errorMessage: string | null;
};

/**
 * Server Action that authenticates one user from form data and returns a
 * serializable UI state for the sign-in page.
 */
export async function signIn(
  _previousState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const useCase = new SignInWithEmailPasswordUseCase(
    createServerAuthRepository(),
  );
  const result = await useCase.execute({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });

  if (result.isErr()) {
    return {
      status: 'error',
      errorMessage: result.error.message,
    };
  }

  return {
    status: 'success',
    errorMessage: null,
  };
}
