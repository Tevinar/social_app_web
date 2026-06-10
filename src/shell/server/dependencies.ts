import 'server-only';

import { AuthRepositoryImpl } from '@/features/auth/server/data/repositories/auth-repository-impl';
import { EncryptedCookieAuthSessionStore } from '@/features/auth/server/data/sources/local/auth-session-store';
import { CookieDeviceIdStore } from '@/features/auth/server/data/sources/local/device-id-store';
import { GetCurrentUserIdUseCase } from '@/features/auth/server/domain/usecases/get-current-user-id.usecase';
import { SignInWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-in-with-email-password.usecase';
import { SignUpWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-up-with-email-password.usecase';
import { SignOutCurrentUserUseCase } from '@/features/auth/server/domain/usecases/sign-out-current-user.usecase';
import { FetchHttpClient } from '@/core/http/http-client';
import { AuthRemoteDataSourceImpl } from '@/features/auth/server/data/sources/remote/auth-backend-data-source';

const httpClient = new FetchHttpClient();

// Auth feature dependencies
const authRemoteDataSource = new AuthRemoteDataSourceImpl(httpClient);
const authSessionStore = new EncryptedCookieAuthSessionStore();
const deviceIdStore = new CookieDeviceIdStore();
const authRepository = new AuthRepositoryImpl(
  authRemoteDataSource,
  authSessionStore,
  deviceIdStore,
);

/**
 * Central server-side dependency graph shared by auth actions and shell
 * helpers.
 */
export const serverDependencies = {
  auth: {
    // Data sources
    backendDataSource: authRemoteDataSource,
    sessionStore: authSessionStore,
    deviceIdStore,
    // Repositories
    repository: authRepository,
    // Use cases
    signInWithEmailPasswordUseCase: new SignInWithEmailPasswordUseCase(
      authRepository,
    ),
    signUpWithEmailPasswordUseCase: new SignUpWithEmailPasswordUseCase(
      authRepository,
    ),
    getCurrentUserIdUseCase: new GetCurrentUserIdUseCase(authRepository),
    signOutCurrentUserUseCase: new SignOutCurrentUserUseCase(authRepository),
  },
} as const;
