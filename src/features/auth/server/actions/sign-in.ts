'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { readFormDataString } from '@/features/auth/server/actions/read-form-data-string';
import { SignInWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-in-with-email-password.usecase';
import { serverContainer } from '@/shell/server/dependencies/init-dependencies';
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
  return Sentry.withServerActionInstrumentation(
    'signIn',
    async (): Promise<SignInActionState> => {
      const result = await serverContainer
        .resolve(SignInWithEmailPasswordUseCase)
        .execute({
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
    },
  );
}
