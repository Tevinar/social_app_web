'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { readFormDataString } from '@/features/auth/server/actions/read-form-data-string';
import { SignUpWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-up-with-email-password.usecase';
import { serverContainer } from '@/shell/server/init-dependencies';

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
  return Sentry.withServerActionInstrumentation(
    'signUp',
    async (): Promise<SignUpActionState> => {
      const result = await serverContainer
        .resolve(SignUpWithEmailPasswordUseCase)
        .execute({
          name: readFormDataString(formData, 'name'),
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
