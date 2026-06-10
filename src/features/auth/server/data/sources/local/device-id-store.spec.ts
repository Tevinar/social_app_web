/** @jest-environment node */

import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { Environment } from '@/core/config/environment';
import { EnvVariable } from '@/core/config/env-variable';
import { authCookies } from '@/features/auth/neutral/constants/auth-cookies';
import { CookieDeviceIdStore } from '@/features/auth/server/data/sources/local/device-id-store';

// Mock Next's request-scoped cookie store because this datasource persists device ids through cookies.
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock UUID generation so created device ids are deterministic in assertions.
jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('CookieDeviceIdStore', () => {
  const cookieStore = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(cookieStore);
    delete process.env[EnvVariable.AppEnv];
  });

  it('given a persisted device-id cookie when reading the device id then it returns the current device id', async () => {
    cookieStore.get.mockReturnValue({ value: 'device_1' });

    const result = await new CookieDeviceIdStore().getDeviceId();

    expect(cookieStore.get).toHaveBeenCalledWith(authCookies.deviceId);
    expect(result).toBe('device_1');
  });

  it('given a missing or empty device-id cookie when reading the device id then it returns null', async () => {
    cookieStore.get.mockReturnValueOnce(undefined).mockReturnValueOnce({
      value: '',
    });

    const store = new CookieDeviceIdStore();
    await expect(store.getDeviceId()).resolves.toBeNull();
    await expect(store.getDeviceId()).resolves.toBeNull();
  });

  it('given an existing device-id cookie when getting or creating the device id then it reuses the existing id', async () => {
    cookieStore.get.mockReturnValue({ value: 'device_1' });

    const result = await new CookieDeviceIdStore().getOrCreateDeviceId();

    expect(randomUUID).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(result).toBe('device_1');
  });

  it('given no existing device-id cookie when getting or creating the device id then it creates and persists a new id', async () => {
    cookieStore.get.mockReturnValue(undefined);
    (randomUUID as jest.Mock).mockReturnValue('generated-device-id');
    process.env[EnvVariable.AppEnv] = Environment.Staging;

    const result = await new CookieDeviceIdStore().getOrCreateDeviceId();

    expect(cookieStore.set).toHaveBeenCalledWith(
      authCookies.deviceId,
      'generated-device-id',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      }),
    );
    expect(result).toBe('generated-device-id');
  });
});
