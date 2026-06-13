/** @jest-environment node */

import { err, ok } from 'neverthrow';
import { ValidationFailure } from '@/core/errors/failures';
import { signIn } from '@/features/auth/server/actions/sign-in';
import { User } from '@/features/auth/neutral/domain/entities/user';
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

describe('signIn action', () => {
  const mockExecute = jest.fn();
  const mockResolve = serverContainer.resolve as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolve.mockReturnValue({
      execute: mockExecute,
    });
  });

  it('given a failing sign-in use case when the action runs then it returns an error state', async () => {
    mockExecute.mockResolvedValue(
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
    mockExecute.mockResolvedValue(
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

    expect(mockExecute).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: '123456',
    });
  });

  it('given file entries in the sign-in form when the action runs then it passes empty strings instead of object stringification', async () => {
    mockExecute.mockResolvedValue(
      ok(new User('user_1', 'Alice', 'alice@example.com')),
    );

    const formData = new FormData();
    formData.set(
      'email',
      new File(['alice@example.com'], 'email.txt', { type: 'text/plain' }),
    );
    formData.set(
      'password',
      new File(['123456'], 'password.txt', { type: 'text/plain' }),
    );

    await signIn({ status: 'idle', errorMessage: null }, formData);

    expect(mockExecute).toHaveBeenCalledWith({
      email: '',
      password: '',
    });
  });
});
