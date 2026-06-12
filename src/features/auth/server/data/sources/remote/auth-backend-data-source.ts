import 'server-only';

import type { HttpClient } from '@/core/http/http-client';
import { AuthenticatedUserModel } from '@/features/auth/server/data/models/authenticated-user-model';

/**
 * Dependency-injection token for `AuthRemoteDataSource`.
 */
export const AUTH_REMOTE_DATA_SOURCE = Symbol('AUTH_REMOTE_DATA_SOURCE');

/**
 * Remote boundary for direct backend authentication requests.
 */
export interface AuthRemoteDataSource {
  /**
   * Registers a user and returns the authenticated user payload.
   */
  signUpWithEmailPassword(params: {
    name: string;
    email: string;
    password: string;
    deviceId: string;
  }): Promise<AuthenticatedUserModel>;

  /**
   * Authenticates a user and returns the signed-in user payload.
   */
  signInWithEmailPassword(params: {
    email: string;
    password: string;
    deviceId: string;
  }): Promise<AuthenticatedUserModel>;

  /**
   * Revokes the current authenticated refresh session.
   */
  signOut(params: { refreshToken: string; deviceId: string }): Promise<void>;
}

/**
 * Backend-facing implementation of `AuthRemoteDataSource`.
 */
export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  constructor(private readonly httpClient: HttpClient) {}

  async signUpWithEmailPassword(params: {
    name: string;
    email: string;
    password: string;
    deviceId: string;
  }): Promise<AuthenticatedUserModel> {
    const body = await this.httpClient.requestJson({
      path: '/auth/sign-up',
      method: 'POST',
      json: {
        name: params.name,
        email: params.email,
        password: params.password,
        deviceId: params.deviceId,
      },
    });

    return AuthenticatedUserModel.fromJson(body);
  }

  async signInWithEmailPassword(params: {
    email: string;
    password: string;
    deviceId: string;
  }): Promise<AuthenticatedUserModel> {
    const body = await this.httpClient.requestJson({
      path: '/auth/sign-in',
      method: 'POST',
      json: {
        email: params.email,
        password: params.password,
        deviceId: params.deviceId,
      },
    });

    return AuthenticatedUserModel.fromJson(body);
  }

  async signOut(params: {
    refreshToken: string;
    deviceId: string;
  }): Promise<void> {
    await this.httpClient.requestVoid({
      path: '/auth/sign-out',
      method: 'POST',
      json: {
        refreshToken: params.refreshToken,
        deviceId: params.deviceId,
      },
    });
  }
}
