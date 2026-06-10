/** @jest-environment node */

import { ok, err } from 'neverthrow';
import SessionCheckPage from '@/app/auth/session-check/page';
import { UnexpectedFailure } from '@/core/errors/failures';
import {
  authAttemptSources,
  authErrorCodes,
  authSearchParams,
} from '@/features/auth/neutral/constants/auth-search-params';
import { routes } from '@/shell/neutral/routes';
import { getCurrentUserId } from '@/shell/server/session/get-current-user-id';
import { redirect } from 'next/navigation';

// Mock the session helper so each test can drive the authenticated/unauthenticated branch explicitly.
jest.mock('@/shell/server/session/get-current-user-id', () => ({
  getCurrentUserId: jest.fn(),
}));

// Mock Next redirects because this page signals navigation by throwing the framework redirect sentinel.
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

describe('SessionCheckPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('given a valid persisted session when the page runs then it redirects to the protected home page', async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue(ok('user_1'));

    await expect(
      SessionCheckPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith(routes.home);
  });

  it('given a sign-up auth attempt and no persisted session when the page runs then it redirects back to sign-up with the session-required error', async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue(ok(null));

    await expect(
      SessionCheckPage({
        searchParams: Promise.resolve({
          [authSearchParams.attempt]: authAttemptSources.signUp,
        }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith(
      `${routes.auth.signUp}?${authSearchParams.error}=${authErrorCodes.sessionRequired}`,
    );
  });

  it('given a sign-in auth attempt and no persisted session when the page runs then it redirects back to sign-in with the session-required error', async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue(
      err(new UnexpectedFailure('no session')),
    );

    await expect(
      SessionCheckPage({
        searchParams: Promise.resolve({
          [authSearchParams.attempt]: authAttemptSources.signIn,
        }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith(
      `${routes.auth.signIn}?${authSearchParams.error}=${authErrorCodes.sessionRequired}`,
    );
  });

  it('given repeated auth-attempt query params when the page runs then it uses the first string value', async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue(ok(null));

    await expect(
      SessionCheckPage({
        searchParams: Promise.resolve({
          [authSearchParams.attempt]: [authAttemptSources.signUp, 'ignored'],
        }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith(
      `${routes.auth.signUp}?${authSearchParams.error}=${authErrorCodes.sessionRequired}`,
    );
  });
});
