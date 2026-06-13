'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary-background">
      <div className="flex w-md flex-col gap-5 items-center text-center rounded-[28px] border border-border bg-background px-7 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
        <h1 className="text-2xl font-semibold text-primary-text">
          Authentication screen failed to load
        </h1>
        <p className="max-w-md text-sm text-secondary-text">
          An unexpected error happened while rendering this authentication page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
