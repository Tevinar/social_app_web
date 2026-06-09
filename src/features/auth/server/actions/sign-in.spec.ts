/** @jest-environment node */

import { err, ok } from 'neverthrow';
import { ValidationFailure } from '@/core/errors/failures';
import { signIn } from '@/features/auth/server/actions/sign-in';
import { User } from '@/features/auth/neutral/domain/entities/user';
import { serverDependencies } from '@/shell/server/dependencies';

// Mock the composition root so the action test can control the injected use case directly.
jest.mock('@/shell/server/dependencies', () => ({
  serverDependencies: {
    auth: {
      signInWithEmailPasswordUseCase: {
        execute: jest.fn(),
      },
    },
  },
}));

describe('signIn action', () => {
  const execute = serverDependencies.auth.signInWithEmailPasswordUseCase
    .execute as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('given a failing sign-in use case when the action runs then it returns an error state', async () => {
    execute.mockResolvedValue(
      err(new ValidationFailure('Invalid email or password.')),
    );

    const formData = new FormData();
    formData.set('email', 'alice@example.com');
    formData.set('password', '123456');

    await expect(
      signIn({ status: 'idle', errorMessage: null }, formData),
    ).resolves.toEqual({
      status: 'error',
      errorMessage: 'Invalid email or password.',
    });
  });

  it('given a successful sign-in use case when the action runs then it extracts the form data and returns success', async () => {
    execute.mockResolvedValue(
      ok(new User('user_1', 'Alice', 'alice@example.com')),
    );

    const formData = new FormData();
    formData.set('email', 'alice@example.com');
    formData.set('password', '123456');

    await expect(
      signIn({ status: 'idle', errorMessage: null }, formData),
    ).resolves.toEqual({
      status: 'success',
      errorMessage: null,
    });

    expect(execute).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: '123456',
    });
  });
});
