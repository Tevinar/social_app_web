import 'server-only';

import type { AxiosInstance } from 'axios';
import { UnauthorizedException } from '@/core/errors/exceptions';
import { JsonReader } from '@/core/serialization/json-reader';
import type { AuthSessionStore } from '@/features/auth/server/data/sources/local/auth-session-store';
import type { DeviceIdStore } from '@/features/auth/server/data/sources/local/device-id-store';
import { AuthSessionModel } from '@/features/auth/server/data/models/auth-session-model';

/**
 * Refreshes the authenticated backend session through the backend API.
 */
export class BackendAuthSessionRefresher {
  constructor(
    private readonly axiosInstance: AxiosInstance,
    private readonly authSessionStore: AuthSessionStore,
    private readonly deviceIdStore: DeviceIdStore,
  ) {}

  /**
   * Requests a fresh authenticated session from the backend and persists it in
   * the current request cookie store.
   */
  async refreshSession(): Promise<AuthSessionModel> {
    const session = await this.authSessionStore.getSession();

    if (session === null) {
      throw new UnauthorizedException({
        message: 'Missing auth session',
      });
    }

    const deviceId = await this.deviceIdStore.getDeviceId();

    if (deviceId === null) {
      throw new UnauthorizedException({
        message: 'Missing auth device id',
      });
    }

    const response = await this.axiosInstance.post('/auth/refresh', {
      refreshToken: session.refreshToken,
      deviceId,
    });

    const body = JsonReader.asObject(
      response.data,
      'response',
      'Response payload',
    );

    const refreshedSession = AuthSessionModel.fromJson(body, {
      userId: session.userId,
    });

    await this.authSessionStore.saveSession(refreshedSession);
    return refreshedSession;
  }
}
