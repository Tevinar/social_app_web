import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  typedRoutes: true,
};

export default withSentryConfig(nextConfig, {
  // Keep Sentry build logs quiet locally, but show them in CI (when
  // app is built in a github workflow).
  silent: !process.env.CI,
});
