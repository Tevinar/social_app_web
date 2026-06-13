import * as Sentry from '@sentry/nextjs';
import {
  createRuntimeSentryInitOptions,
  readRuntimeSentrySettings,
  shouldInitializeRuntimeSentry,
} from '@/sentry-runtime-options';
// Special Next reserved file for client-side instrumentation
// This file is automatically included in the client-side bundle.

const sentryRuntimeSettings = readRuntimeSentrySettings();

if (shouldInitializeRuntimeSentry(sentryRuntimeSettings)) {
  // initialize Sentry for the client runtime
  Sentry.init(createRuntimeSentryInitOptions(sentryRuntimeSettings));
}

// Instruments client route changes for extra tracing and performance context in Sentry.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
