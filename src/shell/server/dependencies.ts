import 'server-only';

import { AuthRepositoryImpl } from '@/features/auth/server/data/repositories/auth_repository_impl';
import { EncryptedCookieAuthSessionStore } from '@/features/auth/server/data/sources/local/auth_session_store';
import { CookieDeviceIdStore } from '@/features/auth/server/data/sources/local/device_id_store';
import { NestAuthBackendDataSource } from '@/features/auth/server/data/sources/remote/auth_backend_data_source';
import { GetCurrentUserIdUseCase } from '@/features/auth/server/domain/usecases/get-current-user-id.usecase';
import { SignInWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-in-with-email-password.usecase';
import { SignUpWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-up-with-email-password.usecase';
import { SignOutCurrentUserUseCase } from '@/features/auth/server/domain/usecases/sign_out_current_user.usecase';
import { FetchHttpClient } from '@/core/http/http_client';

const httpClient = new FetchHttpClient();

// Auth feature dependencies
const authBackendDataSource = new NestAuthBackendDataSource(httpClient);
const authSessionStore = new EncryptedCookieAuthSessionStore();
const deviceIdStore = new CookieDeviceIdStore();
const authRepository = new AuthRepositoryImpl(
  authBackendDataSource,
  authSessionStore,
  deviceIdStore,
);
const getCurrentUserIdUseCase = new GetCurrentUserIdUseCase(authRepository);
const signOutCurrentUserUseCase = new SignOutCurrentUserUseCase(authRepository);

/**
 * Central server-side dependency graph shared by auth actions and shell
 * helpers.
 */
export const serverDependencies = {
  auth: {
    backendDataSource: authBackendDataSource,
    sessionStore: authSessionStore,
    deviceIdStore,
    repository: authRepository,
    signInWithEmailPasswordUseCase: new SignInWithEmailPasswordUseCase(
      authRepository,
    ),
    signUpWithEmailPasswordUseCase: new SignUpWithEmailPasswordUseCase(
      authRepository,
    ),
    getCurrentUserIdUseCase,
    signOutCurrentUserUseCase,
  },
} as const;
