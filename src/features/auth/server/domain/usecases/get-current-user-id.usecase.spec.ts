/** @jest-environment node */

import { ok } from 'neverthrow';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import { GetCurrentUserIdUseCase } from '@/features/auth/server/domain/usecases/get-current-user-id.usecase';

describe('GetCurrentUserIdUseCase', () => {
  it('given the current-user-id use case when executed then it delegates to the auth repository', async () => {
    const repository: jest.Mocked<AuthRepository> = {
      signInWithEmailPassword: jest.fn(),
      signUpWithEmailPassword: jest.fn(),
      getCurrentUserId: jest.fn().mockResolvedValue(ok('user_123')),
      signOut: jest.fn(),
    };

    const useCase = new GetCurrentUserIdUseCase(repository);
    const result = await useCase.execute();

    expect(repository.getCurrentUserId).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe('user_123');
  });
});
