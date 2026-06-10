/** @jest-environment node */

import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { InvalidResponseException } from '@/core/errors/exceptions';
import { Environment } from '@/core/config/environment';
import { EnvVariable } from '@/core/config/env-variable';
import { requireSecretFile } from '@/core/config/require-secret-file';
import { authCookies } from '@/features/auth/neutral/constants/auth-cookies';
import { AuthSessionModel } from '@/features/auth/server/data/models/auth-session-model';
import { EncryptedCookieAuthSessionStore } from '@/features/auth/server/data/sources/local/auth-session-store';

// Mock Next's request-scoped cookie store because this datasource persists auth state through cookies.
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock secret-file loading so encryption tests can run without touching the real filesystem.
jest.mock('@/core/config/require_secret_file', () => ({
  requireSecretFile: jest.fn(),
}));

// Mock jose primitives so the tests focus on store behavior instead of real encryption internals.
jest.mock('jose', () => ({
  EncryptJWT: jest.fn(),
  jwtDecrypt: jest.fn(),
}));

describe('EncryptedCookieAuthSessionStore', () => {
  const cookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
  const session = new AuthSessionModel(
    'user_1',
    'access-token',
    'refresh-token',
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-02-01T00:00:00.000Z'),
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(cookieStore);
    (requireSecretFile as jest.Mock).mockReturnValue('secret');
    delete process.env[EnvVariable.AppEnv];

    (EncryptJWT as unknown as jest.Mock).mockImplementation(() => {
      const chain = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        encrypt: jest.fn().mockResolvedValue('encrypted-session'),
      };

      return chain;
    });
  });

  it('given no auth-session cookie when getting the session then it returns null', async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(
      new EncryptedCookieAuthSessionStore().getSession(),
    ).resolves.toBeNull();
  });

  it('given a valid encrypted auth-session cookie when getting the session then it decrypts and parses the stored session', async () => {
    cookieStore.get.mockReturnValue({ value: 'encrypted-cookie' });
    (jwtDecrypt as jest.Mock).mockResolvedValue({
      payload: session.toJson(),
    });

    const result = await new EncryptedCookieAuthSessionStore().getSession();

    expect(jwtDecrypt).toHaveBeenCalledWith(
      'encrypted-cookie',
      createHash('sha256').update('secret', 'utf8').digest(),
      {
        keyManagementAlgorithms: ['dir'],
        contentEncryptionAlgorithms: ['A256GCM'],
      },
    );
    expect(result?.userId).toBe('user_1');
  });

  it('given an invalid encrypted auth-session cookie when getting the session then it throws a normalized invalid-response exception', async () => {
    cookieStore.get.mockReturnValue({ value: 'encrypted-cookie' });
    (jwtDecrypt as jest.Mock).mockRejectedValue(new Error('boom'));

    await expect(
      new EncryptedCookieAuthSessionStore().getSession(),
    ).rejects.toThrow(InvalidResponseException);
  });

  it('given a session model in a local environment when saving the session then it encrypts and persists the session cookie without the secure flag', async () => {
    process.env[EnvVariable.AppEnv] = Environment.Local;

    await new EncryptedCookieAuthSessionStore().saveSession(session);

    expect(cookieStore.set).toHaveBeenCalledWith(
      authCookies.session,
      'encrypted-session',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        expires: session.refreshTokenExpiresAt,
      }),
    );
  });

  it('given a session model in a non-local environment when saving the session then it marks the cookie secure', async () => {
    process.env[EnvVariable.AppEnv] = Environment.Production;

    await new EncryptedCookieAuthSessionStore().saveSession(session);

    expect(cookieStore.set).toHaveBeenCalledWith(
      authCookies.session,
      'encrypted-session',
      expect.objectContaining({
        secure: true,
      }),
    );
  });

  it('given a persisted auth-session cookie when clearing the session then it deletes the session cookie', async () => {
    await new EncryptedCookieAuthSessionStore().clearSession();

    expect(cookieStore.delete).toHaveBeenCalledWith(authCookies.session);
  });
});
