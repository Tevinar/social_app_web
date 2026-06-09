/** @jest-environment node */

import { InvalidResponseException } from '@/core/errors/exceptions';
import { User } from '@/features/auth/neutral/domain/entities/user';
import { UserModel } from '@/features/auth/neutral/data/models/user-model';

describe('UserModel', () => {
  it('given a valid user payload when parsing from JSON then it returns the user model', () => {
    expect(
      UserModel.fromJson({
        id: 'user_1',
        name: 'Alice',
        email: 'alice@example.com',
      }),
    ).toEqual({
      id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('given an invalid user payload when parsing from JSON then it throws an invalid-response exception', () => {
    expect(() =>
      UserModel.fromJson({
        id: 'user_1',
        name: '',
        email: 'alice@example.com',
      }),
    ).toThrow(InvalidResponseException);
  });

  it('given a user entity and model when mapping then it converts in both directions', () => {
    const entity = new User('user_1', 'Alice', 'alice@example.com');

    expect(UserModel.fromEntity(entity)).toEqual({
      id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
    });

    const reconstructed = UserModel.toEntity({
      id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
    });

    expect(reconstructed).toBeInstanceOf(User);
    expect(reconstructed.toString()).toBe('Alice');
  });
});
