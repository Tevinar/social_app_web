/** @jest-environment node */

import { UnexpectedFailure } from '@/core/errors/failures';
import { InvalidResponseException } from '@/core/errors/exceptions';
import { User } from '@/features/auth/neutral/domain/entities/user';
import { UserModel } from '@/features/auth/neutral/data/models/user-model';
import { AuthSessionModel } from '@/features/auth/server/data/models/auth_session_model';
import { AuthRepositoryImpl } from '@/features/auth/server/data/repositories/auth_repository_impl';
import type { AuthSessionStore } from '@/features/auth/server/data/sources/local/auth_session_store';
import type { DeviceIdStore } from '@/features/auth/server/data/sources/local/device_id_store';
import { AuthRemoteDataSource } from '../sources/remote/auth_backend_data_source';
describe('AuthRepositoryImpl', () => {
  const session = new AuthSessionModel(
    'user_1',
    'access-token',
    'refresh-token',
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-02-01T00:00:00.000Z'),
  );
  const userModel = UserModel.fromEntity(
    new User('user_1', 'Alice', 'alice@example.com'),
  );

  const backend: jest.Mocked<AuthRemoteDataSource> = {
    signUpWithEmailPassword: jest.fn(),
    signInWithEmailPassword: jest.fn(),
    signOut: jest.fn(),
  };
  const authSessionStore: jest.Mocked<AuthSessionStore> = {
    getSession: jest.fn(),
    saveSession: jest.fn(),
    clearSession: jest.fn(),
  };
  const deviceIdStore: jest.Mocked<DeviceIdStore> = {
    getDeviceId: jest.fn(),
    getOrCreateDeviceId: jest.fn(),
  };

  const repository = new AuthRepositoryImpl(
    backend,
    authSessionStore,
    deviceIdStore,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('given a stored session when getting the current user id then it returns the stored user id', async () => {
    authSessionStore.getSession.mockResolvedValue(session);

    const result = await repository.getCurrentUserId();

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe('user_1');
  });

  it('given a local session error when getting the current user id then it maps the error to a failure', async () => {
    authSessionStore.getSession.mockRejectedValue(
      new InvalidResponseException({ message: 'broken cookie' }),
    );

    const result = await repository.getCurrentUserId();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnexpectedFailure);
  });

  it('given a successful backend sign-in when signing in then it persists the session and returns the user entity', async () => {
    deviceIdStore.getOrCreateDeviceId.mockResolvedValue('device_1');
    backend.signInWithEmailPassword.mockResolvedValue({
      session,
      user: userModel,
    });

    const result = await repository.signInWithEmailPassword({
      email: 'alice@example.com',
      password: '123456',
    });

    expect(backend.signInWithEmailPassword).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: '123456',
      deviceId: 'device_1',
    });
    expect(authSessionStore.saveSession).toHaveBeenCalledWith(session);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(
      new User('user_1', 'Alice', 'alice@example.com'),
    );
  });

  it('given a successful backend sign-up when signing up then it persists the session and returns the user entity', async () => {
    deviceIdStore.getOrCreateDeviceId.mockResolvedValue('device_1');
    backend.signUpWithEmailPassword.mockResolvedValue({
      session,
      user: userModel,
    });

    const result = await repository.signUpWithEmailPassword({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    });

    expect(backend.signUpWithEmailPassword).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
      deviceId: 'device_1',
    });
    expect(authSessionStore.saveSession).toHaveBeenCalledWith(session);
    expect(result.isOk()).toBe(true);
  });

  it('given a stored session and device id when signing out then it revokes the remote session and clears the local session', async () => {
    authSessionStore.getSession.mockResolvedValue(session);
    deviceIdStore.getDeviceId.mockResolvedValue('device_1');

    const result = await repository.signOut();

    expect(backend.signOut).toHaveBeenCalledWith({
      refreshToken: 'refresh-token',
      deviceId: 'device_1',
    });
    expect(authSessionStore.clearSession).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
  });

  it('given no stored session to revoke remotely when signing out then it still clears the local session', async () => {
    authSessionStore.getSession.mockResolvedValue(null);
    deviceIdStore.getDeviceId.mockResolvedValue('device_1');

    const result = await repository.signOut();

    expect(backend.signOut).not.toHaveBeenCalled();
    expect(authSessionStore.clearSession).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
  });

  it('given a remote sign-out failure when signing out then it returns a failure but still clears the local session', async () => {
    authSessionStore.getSession.mockResolvedValue(session);
    deviceIdStore.getDeviceId.mockResolvedValue('device_1');
    backend.signOut.mockRejectedValue(
      new InvalidResponseException({ message: 'broken response' }),
    );

    const result = await repository.signOut();

    expect(authSessionStore.clearSession).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnexpectedFailure);
  });
});
