/** @jest-environment node */

import { err, ok } from 'neverthrow';
import { ValidationFailure } from '@/core/errors/failures';
import { AuthFailureMessages } from '@/core/errors/failure_messages';
import { User } from '@/features/auth/neutral/domain/entities/user';
import { SignInWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-in-with-email-password.usecase';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';

describe('SignInWithEmailPasswordUseCase', () => {
  const repository: jest.Mocked<AuthRepository> = {
    signInWithEmailPassword: jest.fn(),
    signUpWithEmailPassword: jest.fn(),
    getCurrentUserId: jest.fn(),
    signOut: jest.fn(),
  };

  const useCase = new SignInWithEmailPasswordUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('given invalid credentials when the sign-in use case executes then it returns a validation failure and does not call the repository', async () => {
    const result = await useCase.execute({
      email: 'bad-email',
      password: '123',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ValidationFailure);
    expect(result._unsafeUnwrapErr().message).toBe(
      AuthFailureMessages.invalidEmail,
    );
    expect(repository.signInWithEmailPassword).not.toHaveBeenCalled();
  });

  it('given a valid email with surrounding whitespace when the sign-in use case executes then it trims the email before delegating to the repository', async () => {
    const user = new User('user_1', 'Alice', 'alice@example.com');
    repository.signInWithEmailPassword.mockResolvedValue(ok(user));

    const result = await useCase.execute({
      email: '  alice@example.com  ',
      password: '123456',
    });

    expect(repository.signInWithEmailPassword).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: '123456',
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(user);
  });

  it('given a repository failure when the sign-in use case executes then it returns that failure unchanged', async () => {
    const failure = new ValidationFailure('backend failure');
    repository.signInWithEmailPassword.mockResolvedValue(err(failure));

    const result = await useCase.execute({
      email: 'alice@example.com',
      password: '123456',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(failure);
  });
});
