import * as Sentry from '@sentry/nextjs';

// Special Next reserved file for server-side instrumentation

// Startup hook that Next.js calls automatically when a new server runtime instance starts.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // initialize Sentry for the Node.js server runtime
    await import('./sentry.server.config');
  }
}

// Add a dedicated `sentry.edge.config.ts` file and load it from `register()`
// if this app later introduces Edge runtime entrypoints (e.g. middleware).

// Sends request-time server/runtime errors that Next reports through this hook to Sentry.
export const onRequestError = Sentry.captureRequestError;
