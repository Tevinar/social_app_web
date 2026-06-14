import 'server-only';

import {
  ServerException,
  UnauthorizedException,
} from '@/core/errors/exceptions';
import { AuthSessionModel } from '@/features/auth/server/data/models/auth-session-model';
import type { AuthSessionStore } from '@/features/auth/server/data/sources/local/auth-session-store';
import { BackendAuthSessionRefresher } from './auth-session-refresher';

/**
 * Time buffer before expiry at which an access token should be refreshed.
 */
const DEFAULT_REFRESH_SKEW_MS = 60_000;

/**
 * Coordinates access-token reuse and refresh for authenticated server-side
 * backend calls.
 */
export class AuthTokenManager {
  constructor(
    private readonly authSessionStore: AuthSessionStore,
    private readonly authSessionRefresher: BackendAuthSessionRefresher,
    private readonly refreshSkewMilliseconds = DEFAULT_REFRESH_SKEW_MS,
  ) {}

  /**
   * Returns a currently valid access token, refreshing it when it is close to
   * expiry.
   */
  async getValidAccessToken(): Promise<string | null> {
    const session = await this.getValidSession();
    return session?.accessToken ?? null;
  }

  /**
   * Forces a refresh and returns the new access token.
   * Useful when:
   * - token was revoked server-side and the client needs
   *   to obtain a new one to recover.
   * - backend considers it expired already because of clock drift
   */
  async forceRefreshAccessToken(): Promise<string> {
    const session = await this.refreshSession();
    return session.accessToken;
  }

  /**
   * Returns the current session when it is still usable, refreshing or clearing
   * it when token-expiration rules require it.
   */
  private async getValidSession(): Promise<AuthSessionModel | null> {
    const session = await this.authSessionStore.getSession();

    if (session === null) {
      return null;
    }

    if (this.isExpired(session.refreshTokenExpiresAt)) {
      await this.authSessionStore.clearSession();
      throw new UnauthorizedException({
        message: 'Refresh session has expired',
      });
    }

    if (this.shouldRefreshAccessToken(session)) {
      return this.refreshSession();
    }

    return session;
  }

  /**
   * Returns whether the access token should be refreshed before the backend is
   * likely to reject it.
   */
  private shouldRefreshAccessToken(session: AuthSessionModel): boolean {
    return (
      Date.now() >=
      session.accessTokenExpiresAt.getTime() - this.refreshSkewMilliseconds
    );
  }

  /**
   * Returns whether the given timestamp is already in the past.
   */
  private isExpired(value: Date): boolean {
    return Date.now() >= value.getTime();
  }

  /**
   * Refreshes the current session and clears the persisted auth state when the
   * refresh flow proves that the caller is no longer authenticated.
   */
  private async refreshSession(): Promise<AuthSessionModel> {
    try {
      return await this.authSessionRefresher.refreshSession();
    } catch (error) {
      if (this.isUnauthorizedRefreshError(error)) {
        await this.authSessionStore.clearSession();
      }

      throw error;
    }
  }

  /**
   * Returns whether one refresh failure means the local session must be
   * discarded immediately.
   */
  private isUnauthorizedRefreshError(error: unknown): boolean {
    if (error instanceof UnauthorizedException) {
      return true;
    }

    return (
      error instanceof ServerException &&
      (error.statusCode === 401 ||
        error.statusCode === 403 ||
        error.code === 'invalid_refresh_token' ||
        error.code === 'invalid_access_token' ||
        error.code === 'unauthorized')
    );
  }
}
