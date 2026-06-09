'use server';

import 'server-only';

import { serverDependencies } from '@/shell/server/dependencies';

/**
 * Serializable UI state returned by the sign-up Server Action.
 */
export type SignUpActionState = {
  readonly status: 'idle' | 'success' | 'error';
  readonly errorMessage: string | null;
};

/**
 * Server Action that registers one user from form data and returns a
 * serializable UI state for a sign-up page.
 */
export async function signUp(
  _currentState: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const result =
    await serverDependencies.auth.signUpWithEmailPasswordUseCase.execute({
      name: String(formData.get('name') ?? ''),
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
