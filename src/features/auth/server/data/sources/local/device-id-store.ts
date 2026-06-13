import 'server-only';

import { Environment } from '@/core/config/environment';
import { EnvVariable } from '@/core/config/env-variable';
import { authCookies } from '@/features/auth/neutral/constants/auth-cookies';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';

/**
 * Dependency-injection token for `DeviceIdStore`.
 */
export const DEVICE_ID_STORE = Symbol('DEVICE_ID_STORE');

/**
 * Local store for the stable device identifier required by the auth API.
 */
export interface DeviceIdStore {
  /**
   * Returns the persisted device identifier, or `null` when none exists.
   */
  getDeviceId(): Promise<string | null>;

  /**
   * Returns the persisted device identifier, creating and persisting one when
   * needed.
   */
  getOrCreateDeviceId(): Promise<string>;
}

/**
 * Cookie-backed implementation of `DeviceIdStore`.
 *
 * The cookie is treated as an essential auth dependency because the backend
 * requires the identifier for sign-in, sign-up, and sign-out flows.
 */
export class CookieDeviceIdStore implements DeviceIdStore {
  async getDeviceId(): Promise<string | null> {
    const cookieStore = await cookies();
    const deviceId = cookieStore.get(authCookies.deviceId)?.value;

    return typeof deviceId === 'string' && deviceId.length > 0
      ? deviceId
      : null;
  }

  async getOrCreateDeviceId(): Promise<string> {
    const existingDeviceId = await this.getDeviceId();
    if (existingDeviceId !== null) {
      return existingDeviceId;
    }

    const deviceId = randomUUID();
    const cookieStore = await cookies();

    cookieStore.set(authCookies.deviceId, deviceId, {
      httpOnly: true,
      secure:
        process.env[EnvVariable.AppEnv] === Environment.Production ||
        process.env[EnvVariable.AppEnv] === Environment.Staging,
      sameSite: 'lax',
      path: '/',
      maxAge: DEVICE_ID_COOKIE_MAX_AGE_SECONDS,
    });

    return deviceId;
  }
}

/**
 * Default cookie lifetime for the stable device identifier, expressed in
 * seconds.
 */
const DEVICE_ID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
