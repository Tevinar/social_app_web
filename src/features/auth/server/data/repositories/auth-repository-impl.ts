import 'server-only';

import { err, ok, type Result } from 'neverthrow';
import { mapExceptionToFailure } from '@/core/errors/failures-mapper';
import type { Failure } from '@/core/errors/failures';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import type { DeviceIdStore } from '@/features/auth/server/data/sources/local/device-id-store';
import type { AuthSessionStore } from '@/features/auth/server/data/sources/local/auth-session-store';
import type { User } from '@/features/auth/neutral/domain/entities/user';
import { UserModel } from '@/features/auth/neutral/data/models/user-model';
import { AuthRemoteDataSource } from '../sources/remote/auth-backend-data-source';

/**
 * Concrete AuthRepository that coordinates backend auth requests with
 * cookie-backed session and device persistence.
 */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly authRemoteDataSource: AuthRemoteDataSource,
    private readonly authSessionStore: AuthSessionStore,
    private readonly deviceIdStore: DeviceIdStore,
  ) {}

  async getCurrentUserId(): Promise<Result<string | null, Failure>> {
    try {
      const session = await this.authSessionStore.getSession();
      return ok(session?.userId ?? null);
    } catch (error) {
      return err(mapExceptionToFailure(error));
    }
  }

  async signInWithEmailPassword(params: {
    email: string;
    password: string;
  }): Promise<Result<User, Failure>> {
    try {
      const deviceId = await this.deviceIdStore.getOrCreateDeviceId();
      const authenticatedUser =
        await this.authRemoteDataSource.signInWithEmailPassword({
          ...params,
          deviceId,
        });

      await this.authSessionStore.saveSession(authenticatedUser.session);
      return ok(UserModel.toEntity(authenticatedUser.user));
    } catch (error) {
      return err(mapExceptionToFailure(error));
    }
  }

  async signUpWithEmailPassword(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<Result<User, Failure>> {
    try {
      const deviceId = await this.deviceIdStore.getOrCreateDeviceId();
      const authenticatedUser =
        await this.authRemoteDataSource.signUpWithEmailPassword({
          ...params,
          deviceId,
        });

      await this.authSessionStore.saveSession(authenticatedUser.session);
      return ok(UserModel.toEntity(authenticatedUser.user));
    } catch (error) {
      return err(mapExceptionToFailure(error));
    }
  }

  async signOut(): Promise<Result<void, Failure>> {
    let signOutError: unknown = null;

    try {
      const session = await this.authSessionStore.getSession();
      const deviceId = await this.deviceIdStore.getDeviceId();

      if (session !== null && deviceId !== null) {
        await this.authRemoteDataSource.signOut({
          refreshToken: session.refreshToken,
          deviceId,
        });
      }
    } catch (error) {
      signOutError = error;
    }

    await this.authSessionStore.clearSession();

    if (signOutError !== null) {
      return err(mapExceptionToFailure(signOutError));
    }

    return ok(undefined);
  }
}
