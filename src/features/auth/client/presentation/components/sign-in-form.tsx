'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGradientButton } from '@/features/auth/client/presentation/components/auth-gradient-button';
import { AuthTextField } from '@/features/auth/client/presentation/components/auth-text-field';
import {
  authAttemptSources,
  authErrorCodes,
  authSearchParams,
} from '@/features/auth/neutral/constants/auth-search-params';
import {
  signIn,
  type SignInActionState,
} from '@/features/auth/server/actions/sign-in';
import { routes } from '@/shell/neutral/routes';

const initialSignInActionState: SignInActionState = {
  status: 'idle',
  errorMessage: null,
};

/**
 * Interactive sign-in form backed by the auth Server Action.
 */
export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, signInAction, isPending] = useActionState(
    signIn,
    initialSignInActionState,
  );
  let errorMessage: string | null = null;

  if (state.status === 'error') {
    // Handles errors returned directly from the Server Action (e.g. invalid credentials)
    errorMessage = state.errorMessage;
  } else if (
    searchParams.get(authSearchParams.error) === authErrorCodes.sessionRequired
  ) {
    // Handles the case where authentication succeeded but the session cookie could not be set in the browser
    // (e.g. due to cookies being disabled).
    errorMessage =
      'Authentication succeeded, but the session could not be saved. Please enable cookies and try again.';
  }

  useEffect(() => {
    if (state.status === 'success') {
      // After a successful sign-in, we need to verify that the session cookie was properly set in the browser.
      // We do this by redirecting to a dedicated session check page that will attempt to read the session
      // cookie and redirect back to the sign-in page with an error if the cookie is not present.
      router.replace(
        `${routes.auth.sessionCheck}?${authSearchParams.attempt}=${authAttemptSources.signIn}`,
      );
    }
  }, [router, state.status]);

  return (
    <form
      action={signInAction}
      className="flex w-md flex-col gap-5 rounded-[28px] border border-border bg-background px-7 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.5)]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white">
          Welcome back
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Sign in
        </h1>
      </div>

      <AuthTextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        disabled={isPending}
      />

      <AuthTextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        disabled={isPending}
      />

      <div aria-live="polite" className="min-h-5 text-sm text-error">
        {errorMessage}
      </div>

      <AuthGradientButton buttonText="Sign in" disabled={isPending} />

      <p className="text-center text-sm text-grey-white">
        Don&apos;t have an account?{' '}
        <Link
          href={routes.auth.signUp}
          className="font-semibold transition text-gradient-2"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
}
