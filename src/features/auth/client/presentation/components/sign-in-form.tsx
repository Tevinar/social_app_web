'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGradientButton } from '@/features/auth/client/presentation/components/auth-gradient-button';
import { AuthTextField } from '@/features/auth/client/presentation/components/auth-text-field';
import {
  signIn,
  type SignInActionState,
} from '@/features/auth/server/actions/sign-in';

const initialSignInActionState: SignInActionState = {
  status: 'idle',
  errorMessage: null,
};

/**
 * Interactive sign-in form backed by the auth Server Action.
 */
export function SignInForm() {
  const router = useRouter();
  const [state, signInAction, isPending] = useActionState(
    signIn,
    initialSignInActionState,
  );

  useEffect(() => {
    if (state.status === 'success') {
      router.replace('/');
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
        <p className="text-sm leading-6 text-white">
          Enter your email and password to access your account.
        </p>
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

      <div aria-live="polite" className="min-h-5 text-sm --color-error">
        {state.status === 'error' ? state.errorMessage : null}
      </div>

      <AuthGradientButton buttonText="Sign in" disabled={isPending} />
    </form>
  );
}
