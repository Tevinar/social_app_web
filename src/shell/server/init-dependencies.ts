import 'server-only';
import 'reflect-metadata';

import { container, instanceCachingFactory } from 'tsyringe';
import {
  FetchHttpClient,
  HTTP_CLIENT,
  type HttpClient,
} from '@/core/http/http-client';
import { AuthRepositoryImpl } from '@/features/auth/server/data/repositories/auth-repository-impl';
import {
  CookieDeviceIdStore,
  DEVICE_ID_STORE,
  type DeviceIdStore,
} from '@/features/auth/server/data/sources/local/device-id-store';
import {
  AUTH_SESSION_STORE,
  EncryptedCookieAuthSessionStore,
  type AuthSessionStore,
} from '@/features/auth/server/data/sources/local/auth-session-store';
import {
  AUTH_REMOTE_DATA_SOURCE,
  AuthRemoteDataSourceImpl,
  type AuthRemoteDataSource,
} from '@/features/auth/server/data/sources/remote/auth-backend-data-source';
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '@/features/auth/server/domain/repositories/auth-repository';
import { GetCurrentUserIdUseCase } from '@/features/auth/server/domain/usecases/get-current-user-id.usecase';
import { SignInWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-in-with-email-password.usecase';
import { SignUpWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-up-with-email-password.usecase';
import { SignOutCurrentUserUseCase } from '@/features/auth/server/domain/usecases/sign-out-current-user.usecase';
import { PinoAppLogger } from './logging/pino-app-logger';

/**
 * Global server-side tsyringe container used as the composition root.
 */
export const serverContainer = container.createChildContainer();

serverContainer.register(PinoAppLogger, {
  useFactory: instanceCachingFactory(() => new PinoAppLogger()),
});

serverContainer.register(HTTP_CLIENT, {
  useFactory: instanceCachingFactory(() => new FetchHttpClient()),
});

/*
 * Init auth feature
 */

serverContainer.register(AUTH_REMOTE_DATA_SOURCE, {
  useFactory: instanceCachingFactory(
    (dependencyContainer) =>
      new AuthRemoteDataSourceImpl(
        dependencyContainer.resolve<HttpClient>(HTTP_CLIENT),
      ),
  ),
});

serverContainer.register(AUTH_SESSION_STORE, {
  useFactory: instanceCachingFactory(
    () => new EncryptedCookieAuthSessionStore(),
  ),
});

serverContainer.register(DEVICE_ID_STORE, {
  useFactory: instanceCachingFactory(() => new CookieDeviceIdStore()),
});

serverContainer.register(AUTH_REPOSITORY, {
  useFactory: instanceCachingFactory(
    (dependencyContainer) =>
      new AuthRepositoryImpl(
        dependencyContainer.resolve<AuthRemoteDataSource>(
          AUTH_REMOTE_DATA_SOURCE,
        ),
        dependencyContainer.resolve<AuthSessionStore>(AUTH_SESSION_STORE),
        dependencyContainer.resolve<DeviceIdStore>(DEVICE_ID_STORE),
      ),
  ),
});

serverContainer.register(SignInWithEmailPasswordUseCase, {
  useFactory: instanceCachingFactory(
    (dependencyContainer) =>
      new SignInWithEmailPasswordUseCase(
        dependencyContainer.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

serverContainer.register(SignUpWithEmailPasswordUseCase, {
  useFactory: instanceCachingFactory(
    (dependencyContainer) =>
      new SignUpWithEmailPasswordUseCase(
        dependencyContainer.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

serverContainer.register(GetCurrentUserIdUseCase, {
  useFactory: instanceCachingFactory(
    (dependencyContainer) =>
      new GetCurrentUserIdUseCase(
        dependencyContainer.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

serverContainer.register(SignOutCurrentUserUseCase, {
  useFactory: instanceCachingFactory(
    (dependencyContainer) =>
      new SignOutCurrentUserUseCase(
        dependencyContainer.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});
