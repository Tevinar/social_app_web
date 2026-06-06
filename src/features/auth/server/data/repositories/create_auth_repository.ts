import 'server-only';

import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth_repository';
import { AuthRepositoryImpl } from '@/features/auth/server/data/repositories/auth_repository_impl';
import { EncryptedCookieAuthSessionStore } from '@/features/auth/server/data/sources/local/auth_session_store';
import { CookieDeviceIdStore } from '@/features/auth/server/data/sources/local/device_id_store';
import { NestAuthBackendDataSource } from '@/features/auth/server/data/sources/remote/auth_backend_data_source';

/**
 * Creates the default server-side auth repository with its concrete runtime
 * dependencies.
 */
export function createServerAuthRepository(): AuthRepository {
  return new AuthRepositoryImpl(
    new NestAuthBackendDataSource(),
    new EncryptedCookieAuthSessionStore(),
    new CookieDeviceIdStore(),
  );
}
