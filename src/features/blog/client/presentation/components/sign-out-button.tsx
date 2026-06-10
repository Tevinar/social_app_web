'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import {
  signOut,
  type SignOutActionState,
} from '@/shell/server/session/sign-out';
import { routes } from '@/shell/neutral/routes';

const initialSignOutActionState: SignOutActionState = {
  status: 'idle',
  errorMessage: null,
};

export function SignOutButton() {
  const router = useRouter();
  const [state, signOutAction, isPending] = useActionState(
    signOut,
    initialSignOutActionState,
  );

  useEffect(() => {
    if (state.status === 'success') {
      router.replace(routes.auth.signIn);
    }
  }, [router, state.status]);

  return (
    <form action={signOutAction} className="flex flex-col gap-2">
      <button
        disabled={isPending}
        type="submit"
        className="text-sm text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Signing out...' : 'Sign out'}
      </button>
      <div aria-live="polite" className="min-h-5 text-sm text-red-600">
        {state.status === 'error' ? state.errorMessage : null}
      </div>
    </form>
  );
}
