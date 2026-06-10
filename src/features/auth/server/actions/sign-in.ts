'use server';

import 'server-only';

import { serverDependencies } from '@/shell/server/dependencies';
import { readFormDataString } from '@/features/auth/server/actions/read-form-data-string';

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
  _currentState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const result =
    await serverDependencies.auth.signInWithEmailPasswordUseCase.execute({
      email: readFormDataString(formData, 'email'),
      password: readFormDataString(formData, 'password'),
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
