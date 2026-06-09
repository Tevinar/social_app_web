/** @jest-environment node */

import { ok } from 'neverthrow';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import { SignOutCurrentUserUseCase } from '@/features/auth/server/domain/usecases/sign_out_current_user.usecase';

describe('SignOutCurrentUserUseCase', () => {
  it('given the sign-out use case when executed then it delegates to the auth repository', async () => {
    const repository: jest.Mocked<AuthRepository> = {
      signInWithEmailPassword: jest.fn(),
      signUpWithEmailPassword: jest.fn(),
      getCurrentUserId: jest.fn(),
      signOut: jest.fn().mockResolvedValue(ok(undefined)),
    };

    const useCase = new SignOutCurrentUserUseCase(repository);
    const result = await useCase.execute();

    expect(repository.signOut).toHaveBeenCalledTimes(1);
    expect(result.isOk()).toBe(true);
  });
});
