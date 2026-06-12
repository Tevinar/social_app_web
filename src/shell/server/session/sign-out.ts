'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { SignOutCurrentUserUseCase } from '@/features/auth/server/domain/usecases/sign-out-current-user.usecase';
import { serverContainer } from '@/shell/server/init-dependencies';

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
  return Sentry.withServerActionInstrumentation(
    'signOut',
    async (): Promise<SignOutActionState> => {
      const result = await serverContainer
        .resolve(SignOutCurrentUserUseCase)
        .execute();

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
    },
  );
}
