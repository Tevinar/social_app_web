import * as Sentry from '@sentry/nextjs';
import {
  createRuntimeSentryInitOptions,
  readRuntimeSentrySettings,
  shouldInitializeRuntimeSentry,
} from '@/sentry-runtime-options';

const sentryRuntimeSettings = readRuntimeSentrySettings();

if (shouldInitializeRuntimeSentry(sentryRuntimeSettings)) {
  Sentry.init(createRuntimeSentryInitOptions(sentryRuntimeSettings));
}
