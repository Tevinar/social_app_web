import 'server-only';

import type { AxiosInstance } from 'axios';
import { container, instanceCachingFactory } from 'tsyringe';
import { BlogRepositoryImpl } from '@/features/blog/server/data/repositories/blog-repository-impl';
import {
  BLOG_REMOTE_DATA_SOURCE,
  BlogRemoteDataSourceImpl,
  type BlogRemoteDataSource,
} from '@/features/blog/server/data/sources/blog-remote-data-source';
import {
  BLOG_REPOSITORY,
  type BlogRepository,
} from '@/features/blog/server/domain/repositories/blog-repository';
import { CreateBlogUseCase } from '@/features/blog/server/domain/usecases/create-blog.usecase';
import { GetBlogListSliceUseCase } from '@/features/blog/server/domain/usecases/get-blog-list-slice.usecase';
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
import { BackendAuthSessionRefresher } from '@/features/auth/server/data/session/auth-session-refresher';
import { AuthTokenManager } from '@/features/auth/server/data/session/auth-token-manager';
import { PinoAppLogger } from '../../../core/server-logging/pino-app-logger';
import {
  AUTHED_SERVER_AXIOS,
  createAuthedServerAxios,
  createPublicServerAxios,
  PUBLIC_SERVER_AXIOS,
} from './axios-factories';

/**
 * Global server-side tsyringe container used as the composition root.
 */
export const serverContainer = container.createChildContainer();

serverContainer.register(PinoAppLogger, {
  useFactory: instanceCachingFactory(() => new PinoAppLogger()),
});

serverContainer.register(PUBLIC_SERVER_AXIOS, {
  useFactory: instanceCachingFactory(() => createPublicServerAxios()),
});

/*
 * Init auth feature
 */

serverContainer.register(AUTH_REMOTE_DATA_SOURCE, {
  useFactory: instanceCachingFactory(
    (container) =>
      new AuthRemoteDataSourceImpl(
        container.resolve<AxiosInstance>(PUBLIC_SERVER_AXIOS),
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

serverContainer.register(BackendAuthSessionRefresher, {
  useFactory: instanceCachingFactory(
    (container) =>
      new BackendAuthSessionRefresher(
        container.resolve<AxiosInstance>(PUBLIC_SERVER_AXIOS),
        container.resolve<AuthSessionStore>(AUTH_SESSION_STORE),
        container.resolve<DeviceIdStore>(DEVICE_ID_STORE),
      ),
  ),
});

serverContainer.register(AuthTokenManager, {
  useFactory: instanceCachingFactory(
    (container) =>
      new AuthTokenManager(
        container.resolve<AuthSessionStore>(AUTH_SESSION_STORE),
        container.resolve(BackendAuthSessionRefresher),
      ),
  ),
});

serverContainer.register(AUTHED_SERVER_AXIOS, {
  useFactory: instanceCachingFactory((container) =>
    createAuthedServerAxios({
      authTokenManager: container.resolve(AuthTokenManager),
    }),
  ),
});

serverContainer.register(AUTH_REPOSITORY, {
  useFactory: instanceCachingFactory(
    (container) =>
      new AuthRepositoryImpl(
        container.resolve<AuthRemoteDataSource>(AUTH_REMOTE_DATA_SOURCE),
        container.resolve<AuthSessionStore>(AUTH_SESSION_STORE),
        container.resolve<DeviceIdStore>(DEVICE_ID_STORE),
        container.resolve(PinoAppLogger),
      ),
  ),
});

serverContainer.register(SignInWithEmailPasswordUseCase, {
  useFactory: instanceCachingFactory(
    (container) =>
      new SignInWithEmailPasswordUseCase(
        container.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

serverContainer.register(SignUpWithEmailPasswordUseCase, {
  useFactory: instanceCachingFactory(
    (container) =>
      new SignUpWithEmailPasswordUseCase(
        container.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

serverContainer.register(GetCurrentUserIdUseCase, {
  useFactory: instanceCachingFactory(
    (container) =>
      new GetCurrentUserIdUseCase(
        container.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

serverContainer.register(SignOutCurrentUserUseCase, {
  useFactory: instanceCachingFactory(
    (container) =>
      new SignOutCurrentUserUseCase(
        container.resolve<AuthRepository>(AUTH_REPOSITORY),
      ),
  ),
});

/*
 * Init blog feature
 */

serverContainer.register(BLOG_REMOTE_DATA_SOURCE, {
  useFactory: instanceCachingFactory(
    (container) =>
      new BlogRemoteDataSourceImpl(
        container.resolve<AxiosInstance>(AUTHED_SERVER_AXIOS),
      ),
  ),
});

serverContainer.register(BLOG_REPOSITORY, {
  useFactory: instanceCachingFactory(
    (container) =>
      new BlogRepositoryImpl(
        container.resolve<BlogRemoteDataSource>(BLOG_REMOTE_DATA_SOURCE),
        container.resolve(PinoAppLogger),
      ),
  ),
});

serverContainer.register(CreateBlogUseCase, {
  useFactory: instanceCachingFactory(
    (container) =>
      new CreateBlogUseCase(container.resolve<BlogRepository>(BLOG_REPOSITORY)),
  ),
});

serverContainer.register(GetBlogListSliceUseCase, {
  useFactory: instanceCachingFactory(
    (container) =>
      new GetBlogListSliceUseCase(
        container.resolve<BlogRepository>(BLOG_REPOSITORY),
      ),
  ),
});
