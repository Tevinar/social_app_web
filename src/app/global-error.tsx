'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-secondary-background">
          <div className="flex w-md flex-col gap-5 items-center text-center rounded-[28px] border border-border bg-background px-7 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
            <NextError statusCode={0} />
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
