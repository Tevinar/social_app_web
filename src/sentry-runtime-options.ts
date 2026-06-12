import { EnvVariable } from '@/core/config/env-variable';
import { Environment } from '@/core/config/environment';

/**
 * Stable DSN for the social-app-web Sentry project.
 */
export const SENTRY_DSN =
  'https://1201a17d1287e73ac2cb3686fdde6c56@o4511479941627904.ingest.de.sentry.io/4511548064530512';

type SentryRuntimeSettings = {
  environment: string;
  release: string | undefined;
  tracesSampleRateRaw: string | undefined;
};

/**
 * Reads the shared Sentry settings from public runtime environment variables.
 */
export function readRuntimeSentrySettings(): SentryRuntimeSettings {
  return {
    environment: process.env[EnvVariable.NextPublicAppEnv] ?? Environment.Local,
    release: process.env[EnvVariable.NextPublicSentryRelease],
    tracesSampleRateRaw:
      process.env[EnvVariable.NextPublicSentryTracesSampleRate],
  };
}

/**
 * Returns whether Sentry should be initialized for one runtime.
 */
export function shouldInitializeRuntimeSentry(
  settings: SentryRuntimeSettings,
): boolean {
  return SENTRY_DSN.length > 0 && settings.environment !== Environment.Local;
}

/**
 * Creates the shared Sentry init options for one runtime.
 */
export function createRuntimeSentryInitOptions(
  settings: SentryRuntimeSettings,
) {
  return {
    dsn: SENTRY_DSN,
    environment: settings.environment,
    release: settings.release,
    tracesSampleRate: readTracesSampleRate(settings.tracesSampleRateRaw),
  };
}

/**
 * Reads the Sentry trace sample rate from one raw environment value in a safe
 * way.
 */
function readTracesSampleRate(rawValue: string | undefined): number {
  if (rawValue === undefined) {
    return 0;
  }

  const parsedValue = Number(rawValue);

  if (Number.isFinite(parsedValue) && parsedValue >= 0 && parsedValue <= 1) {
    return parsedValue;
  }

  return 0;
}
