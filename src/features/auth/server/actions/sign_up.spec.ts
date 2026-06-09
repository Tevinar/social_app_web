/** @jest-environment node */

import { err, ok } from 'neverthrow';
import { ValidationFailure } from '@/core/errors/failures';
import { User } from '@/features/auth/neutral/domain/entities/user';
import { signUp } from '@/features/auth/server/actions/sign_up';
import { serverDependencies } from '@/shell/server/dependencies';

// Mock the composition root so the action test can control the injected use case directly.
jest.mock('@/shell/server/dependencies', () => ({
  serverDependencies: {
    auth: {
      signUpWithEmailPasswordUseCase: {
        execute: jest.fn(),
      },
    },
  },
}));

describe('signUp action', () => {
  const execute = serverDependencies.auth.signUpWithEmailPasswordUseCase
    .execute as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('given a failing sign-up use case when the action runs then it returns an error state', async () => {
    execute.mockResolvedValue(
      err(new ValidationFailure('Email already in use.')),
    );

    const formData = new FormData();
    formData.set('name', 'Alice');
    formData.set('email', 'alice@example.com');
    formData.set('password', '123456');

    await expect(
      signUp({ status: 'idle', errorMessage: null }, formData),
    ).resolves.toEqual({
      status: 'error',
      errorMessage: 'Email already in use.',
    });
  });

  it('given a successful sign-up use case when the action runs then it extracts the form data and returns success', async () => {
    execute.mockResolvedValue(
      ok(new User('user_1', 'Alice', 'alice@example.com')),
    );

    const formData = new FormData();
    formData.set('name', 'Alice');
    formData.set('email', 'alice@example.com');
    formData.set('password', '123456');

    await expect(
      signUp({ status: 'idle', errorMessage: null }, formData),
    ).resolves.toEqual({
      status: 'success',
      errorMessage: null,
    });

    expect(execute).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    });
  });
});
