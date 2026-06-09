'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGradientButton } from '@/features/auth/client/presentation/components/auth-gradient-button';
import { AuthTextField } from '@/features/auth/client/presentation/components/auth-text-field';
import {
  signUp,
  type SignUpActionState,
} from '@/features/auth/server/actions/sign_up';
import { routes } from '@/shell/neutral/routes';

const initialSignUpActionState: SignUpActionState = {
  status: 'idle',
  errorMessage: null,
};

/**
 * Interactive sign-up form backed by the auth Server Action.
 */
export function SignUpForm() {
  const router = useRouter();
  const [state, signUpAction, isPending] = useActionState(
    signUp,
    initialSignUpActionState,
  );

  useEffect(() => {
    if (state.status === 'success') {
      router.replace(routes.home);
    }
  }, [router, state.status]);

  return (
    <form
      action={signUpAction}
      className="flex w-md flex-col gap-5 rounded-[28px] border border-border bg-background px-7 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.5)]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white">
          Join the community
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Sign up
        </h1>
      </div>

      <AuthTextField
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Your full name"
        disabled={isPending}
      />

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
        autoComplete="new-password"
        placeholder="Create a password"
        disabled={isPending}
      />

      <div aria-live="polite" className="min-h-5 text-sm text-error">
        {state.status === 'error' ? state.errorMessage : null}
      </div>

      <AuthGradientButton buttonText="Sign up" disabled={isPending} />

      <p className="text-center text-sm text-grey-white">
        Already have an account?{' '}
        <Link
          href={routes.auth.signIn}
          className="font-semibold transition text-gradient-2"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
