/**
 * Query-string markers used by the auth flow.
 */
export const authSearchParams = {
  attempt: 'authAttempt',
  error: 'authError',
} as const;

/**
 * Auth-entry sources used to route users back to the correct auth screen when
 * session persistence fails.
 */
export const authAttemptSources = {
  signIn: 'sign-in',
  signUp: 'sign-up',
} as const;

/**
 * Auth-specific error codes rendered on the auth pages.
 */
export const authErrorCodes = {
  sessionRequired: 'session-required',
} as const;
