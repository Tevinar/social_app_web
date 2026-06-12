import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { readOptionalSecretFile } from './src/core/config/read-secret-file';

const nextConfig: NextConfig = {
  typedRoutes: true,
};

const sentryAuthToken =
  process.env.SENTRY_AUTH_TOKEN ??
  readOptionalSecretFile('sentry_auth_token.txt');

export default withSentryConfig(nextConfig, {
  org: 'tevinar',
  project: 'social_app_web',
  ...(sentryAuthToken === undefined ? {} : { authToken: sentryAuthToken }),

  // Optional but recommended for nicer client stack traces
  widenClientFileUpload: true,

  // Keep Sentry build logs quiet locally, but show them in CI (when
  // app is built in a github workflow).
  silent: !process.env.CI,
});
