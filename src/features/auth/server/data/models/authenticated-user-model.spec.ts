/** @jest-environment node */

import { AuthenticatedUserModel } from '@/features/auth/server/data/models/authenticated-user-model';

describe('AuthenticatedUserModel', () => {
  it('given a valid authenticated-user payload when parsing from JSON then it reuses the parsed user id for the session', () => {
    const model = AuthenticatedUserModel.fromJson({
      user: {
        id: 'user_1',
        name: 'Alice',
        email: 'alice@example.com',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accessTokenExpiresAt: '2026-01-01T00:00:00.000Z',
      refreshTokenExpiresAt: '2026-02-01T00:00:00.000Z',
    });

    expect(model.user.id).toBe('user_1');
    expect(model.session.userId).toBe('user_1');
    expect(model.session.refreshToken).toBe('refresh-token');
  });
});
