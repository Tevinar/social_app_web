/** @jest-environment node */

import { err, ok } from 'neverthrow';
import { ValidationFailure } from '@/core/errors/failures';
import { User } from '@/features/auth/neutral/domain/entities/user';
import { signUp } from '@/features/auth/server/actions/sign-up';
import { serverContainer } from '@/shell/server/init-dependencies';

// Mock Sentry instrumentation so the server action callback runs directly in tests.
jest.mock('@sentry/nextjs', () => ({
  withServerActionInstrumentation: jest.fn(
    async (_name: string, callback: () => Promise<unknown>) => callback(),
  ),
}));

// Mock the composition root so the action test can control the injected use case directly.
jest.mock('@/shell/server/init-dependencies', () => ({
  serverContainer: {
    resolve: jest.fn(),
  },
}));

describe('signUp action', () => {
  const mockExecute = jest.fn();
  const mockResolve = serverContainer.resolve as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolve.mockReturnValue({
      execute: mockExecute,
    });
  });

  it('given a failing sign-up use case when the action runs then it returns an error state', async () => {
    mockExecute.mockResolvedValue(
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
    mockExecute.mockResolvedValue(
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

    expect(mockExecute).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    });
  });

  it('given file entries in the sign-up form when the action runs then it passes empty strings instead of object stringification', async () => {
    mockExecute.mockResolvedValue(
      ok(new User('user_1', 'Alice', 'alice@example.com')),
    );

    const formData = new FormData();
    formData.set(
      'name',
      new File(['Alice'], 'name.txt', { type: 'text/plain' }),
    );
    formData.set(
      'email',
      new File(['alice@example.com'], 'email.txt', { type: 'text/plain' }),
    );
    formData.set(
      'password',
      new File(['123456'], 'password.txt', { type: 'text/plain' }),
    );

    await signUp({ status: 'idle', errorMessage: null }, formData);

    expect(mockExecute).toHaveBeenCalledWith({
      name: '',
      email: '',
      password: '',
    });
  });
});
