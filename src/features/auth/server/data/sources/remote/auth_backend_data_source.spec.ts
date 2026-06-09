/** @jest-environment node */

import { NestAuthBackendDataSource } from '@/features/auth/server/data/sources/remote/auth_backend_data_source';
import type { HttpClient } from '@/core/http/http_client';
import { EnvVariable } from '@/core/config/env-variable';

describe('NestAuthBackendDataSource', () => {
  const httpClient: jest.Mocked<HttpClient> = {
    requestJson: jest.fn(),
    requestVoid: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env[EnvVariable.ApiBaseUrl];
  });

  it('given valid sign-up params when calling the remote datasource then it posts to the sign-up endpoint and parses the authenticated user model', async () => {
    httpClient.requestJson.mockResolvedValue({
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

    const dataSource = new NestAuthBackendDataSource(httpClient);
    const result = await dataSource.signUpWithEmailPassword({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
      deviceId: 'device_1',
    });

    expect(httpClient.requestJson).toHaveBeenCalledWith({
      path: '/auth/sign-up',
      method: 'POST',
      json: {
        name: 'Alice',
        email: 'alice@example.com',
        password: '123456',
        deviceId: 'device_1',
      },
    });
    expect(result.user.email).toBe('alice@example.com');
    expect(result.session.userId).toBe('user_1');
  });

  it('given valid sign-in params when calling the remote datasource then it posts to the sign-in endpoint', async () => {
    httpClient.requestJson.mockResolvedValue({
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

    const dataSource = new NestAuthBackendDataSource(httpClient);
    const result = await dataSource.signInWithEmailPassword({
      email: 'alice@example.com',
      password: '123456',
      deviceId: 'device_1',
    });

    expect(httpClient.requestJson).toHaveBeenCalledWith({
      path: '/auth/sign-in',
      method: 'POST',
      json: {
        email: 'alice@example.com',
        password: '123456',
        deviceId: 'device_1',
      },
    });
    expect(result.user.id).toBe('user_1');
  });

  it('given sign-out params when calling the remote datasource then it posts to the sign-out endpoint', async () => {
    const dataSource = new NestAuthBackendDataSource(httpClient);

    await dataSource.signOut({
      refreshToken: 'refresh-token',
      deviceId: 'device_1',
    });

    expect(httpClient.requestVoid).toHaveBeenCalledWith({
      path: '/auth/sign-out',
      method: 'POST',
      json: {
        refreshToken: 'refresh-token',
        deviceId: 'device_1',
      },
    });
  });

  it('given the default HTTP client and no API base URL when constructing the datasource then it throws a configuration error', () => {
    expect(() => new NestAuthBackendDataSource()).toThrow(
      `${EnvVariable.ApiBaseUrl} is not configured`,
    );
  });
});
