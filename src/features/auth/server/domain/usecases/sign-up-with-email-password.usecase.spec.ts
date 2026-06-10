/** @jest-environment node */

import { err, ok } from 'neverthrow';
import { AuthFailureMessages } from '@/core/errors/failure-messages';
import { ValidationFailure } from '@/core/errors/failures';
import { User } from '@/features/auth/neutral/domain/entities/user';
import type { AuthRepository } from '@/features/auth/server/domain/repositories/auth-repository';
import { SignUpWithEmailPasswordUseCase } from '@/features/auth/server/domain/usecases/sign-up-with-email-password.usecase';

describe('SignUpWithEmailPasswordUseCase', () => {
  const repository: jest.Mocked<AuthRepository> = {
    signInWithEmailPassword: jest.fn(),
    signUpWithEmailPassword: jest.fn(),
    getCurrentUserId: jest.fn(),
    signOut: jest.fn(),
  };

  const useCase = new SignUpWithEmailPasswordUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('given invalid credentials when the sign-up use case executes then it returns a credentials validation failure before calling the repository', async () => {
    const result = await useCase.execute({
      name: 'Alice',
      email: 'bad-email',
      password: '123456',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ValidationFailure);
    expect(result._unsafeUnwrapErr().message).toBe(
      AuthFailureMessages.invalidEmail,
    );
    expect(repository.signUpWithEmailPassword).not.toHaveBeenCalled();
  });

  it('given an invalid name when the sign-up use case executes then it returns a name validation failure before calling the repository', async () => {
    const result = await useCase.execute({
      name: 'ab',
      email: 'alice@example.com',
      password: '123456',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ValidationFailure);
    expect(result._unsafeUnwrapErr().message).toBe(
      AuthFailureMessages.invalidName,
    );
    expect(repository.signUpWithEmailPassword).not.toHaveBeenCalled();
  });

  it('given a valid email with surrounding whitespace when the sign-up use case executes then it trims the email and delegates to the repository', async () => {
    const user = new User('user_1', 'Alice', 'alice@example.com');
    repository.signUpWithEmailPassword.mockResolvedValue(ok(user));

    const result = await useCase.execute({
      name: 'Alice',
      email: '  alice@example.com  ',
      password: '123456',
    });

    expect(repository.signUpWithEmailPassword).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(user);
  });

  it('given a repository failure when the sign-up use case executes then it returns that failure unchanged', async () => {
    const failure = new ValidationFailure('backend failure');
    repository.signUpWithEmailPassword.mockResolvedValue(err(failure));

    const result = await useCase.execute({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(failure);
  });
});
