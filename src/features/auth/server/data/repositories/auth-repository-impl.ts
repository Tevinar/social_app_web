import 'server-only';

import { err, ok, type Result } from 'neverthrow';
import { mapExceptionToFailure } from '@/core/errors/failures-mapper';
import { UnexpectedFailure, type Failure } from '@/core/errors/failures';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import type { DeviceIdStore } from '@/features/auth/server/data/sources/local/device-id-store';
import type { AuthSessionStore } from '@/features/auth/server/data/sources/local/auth-session-store';
import type { User } from '@/features/auth/neutral/domain/entities/user';
import { UserModel } from '@/features/auth/neutral/data/models/user-model';
import type { PinoAppLogger } from '@/core/server-logging/pino-app-logger';
import type { AuthRemoteDataSource } from '../sources/remote/auth-backend-data-source';

/**
 * Concrete AuthRepository that coordinates backend auth requests with
 * cookie-backed session and device persistence.
 */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly authRemoteDataSource: AuthRemoteDataSource,
    private readonly authSessionStore: AuthSessionStore,
    private readonly deviceIdStore: DeviceIdStore,
    private readonly appLogger: PinoAppLogger,
  ) {}

  async getCurrentUserId(): Promise<Result<string | null, Failure>> {
    try {
      const session = await this.authSessionStore.getSession();
      return ok(session?.userId ?? null);
    } catch (error) {
      const failure = mapExceptionToFailure(error);

      if (
        failure instanceof UnexpectedFailure &&
        !isNextDynamicServerUsageError(error)
      ) {
        this.appLogger.error(
          'Failed to resolve the current authenticated user id',
          {
            error,
            data: {
              area: 'auth-repository',
              operation: 'getCurrentUserId',
            },
          },
        );
      }

      return err(failure);
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
      const failure = mapExceptionToFailure(error);

      if (failure instanceof UnexpectedFailure) {
        this.appLogger.error(
          'Sign-in with email and password failed unexpectedly',
          {
            error,
            data: {
              area: 'auth-repository',
              operation: 'signInWithEmailPassword',
            },
          },
        );
      }

      return err(failure);
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
      const failure = mapExceptionToFailure(error);

      if (failure instanceof UnexpectedFailure) {
        this.appLogger.error(
          'Sign-up with email and password failed unexpectedly',
          {
            error,
            data: {
              area: 'auth-repository',
              operation: 'signUpWithEmailPassword',
            },
          },
        );
      }

      return err(failure);
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

    try {
      await this.authSessionStore.clearSession();
    } catch (error) {
      signOutError ??= error;
    }

    if (signOutError !== null) {
      const failure = mapExceptionToFailure(signOutError);

      if (failure instanceof UnexpectedFailure) {
        this.appLogger.error('Sign-out failed unexpectedly', {
          error: signOutError,
          data: {
            area: 'auth-repository',
            operation: 'signOut',
          },
        });
      }

      return err(failure);
    }

    return ok(undefined);
  }
}

function isNextDynamicServerUsageError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.startsWith('Dynamic server usage:')
  );
}
