'use server';

import 'server-only';

import { serverDependencies } from '@/shell/server/dependencies';

/**
 * Serializable UI state returned by the sign-out Server Action.
 */
export type SignOutActionState = {
  readonly status: 'idle' | 'success' | 'error';
  readonly errorMessage: string | null;
};

/**
 * Server Action that signs out the current user and returns a serializable UI
 * state for client-side callers.
 */
export async function signOut(
  _currentState: SignOutActionState,
): Promise<SignOutActionState> {
  const result =
    await serverDependencies.auth.signOutCurrentUserUseCase.execute();

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
