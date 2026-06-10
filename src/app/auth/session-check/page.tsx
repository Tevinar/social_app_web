import { redirect } from 'next/navigation';
import {
  authAttemptSources,
  authErrorCodes,
  authSearchParams,
} from '@/features/auth/neutral/constants/auth-search-params';
import { routes } from '@/shell/neutral/routes';
import { getCurrentUserId } from '@/shell/server/session/get-current-user-id';

type SessionCheckPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Verifies, on the first request after auth success, whether the browser
 * actually persisted the session cookie.
 */
export default async function SessionCheckPage({
  searchParams,
}: SessionCheckPageProps) {
  const resolvedSearchParams = await searchParams;
  const authAttemptSource = readStringSearchParam(
    resolvedSearchParams[authSearchParams.attempt],
  );
  const currentUserIdResult = await getCurrentUserId();

  // Redirect to the home page if the session cookie is present and valid in the browser
  if (currentUserIdResult.isOk() && currentUserIdResult.value !== null) {
    redirect(routes.home);
  }

  // If the session cookie is not present or invalid, redirect back to the sign-in or sign-up page
  if (authAttemptSource === authAttemptSources.signUp) {
    redirect(
      `${routes.auth.signUp}?${authSearchParams.error}=${authErrorCodes.sessionRequired}`,
    );
  }

  redirect(
    `${routes.auth.signIn}?${authSearchParams.error}=${authErrorCodes.sessionRequired}`,
  );
}

function readStringSearchParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}
