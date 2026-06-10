/** @jest-environment node */

import { InvalidResponseException } from '@/core/errors/exceptions';
import { AuthSessionModel } from '@/features/auth/server/data/models/auth_session_model';

describe('AuthSessionModel', () => {
  const json = {
    userId: 'user_1',
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessTokenExpiresAt: '2026-01-01T00:00:00.000Z',
    refreshTokenExpiresAt: '2026-02-01T00:00:00.000Z',
  };

  it('given a valid auth-session payload when parsing from JSON then it creates the session model', () => {
    const session = AuthSessionModel.fromJson(json);

    expect(session.userId).toBe('user_1');
    expect(session.accessToken).toBe('access-token');
    expect(session.refreshTokenExpiresAt.toISOString()).toBe(
      '2026-02-01T00:00:00.000Z',
    );
  });

  it('given an override user id when parsing from JSON then it uses the override user id', () => {
    const session = AuthSessionModel.fromJson(json, { userId: 'override' });

    expect(session.userId).toBe('override');
  });

  it('given a session model when converting to JSON then it returns the serializable payload', () => {
    const session = AuthSessionModel.fromJson(json);

    expect(session.toJson()).toEqual(json);
  });

  it('given an invalid auth-session payload when parsing from JSON then it throws an invalid-response exception', () => {
    expect(() =>
      AuthSessionModel.fromJson({
        ...json,
        accessTokenExpiresAt: 'not-a-date',
      }),
    ).toThrow(InvalidResponseException);
  });
});
