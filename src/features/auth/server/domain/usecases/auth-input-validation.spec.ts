/** @jest-environment node */

import { AuthFailureMessages } from '@/core/errors/failure_messages';
import { ValidationFailure } from '@/core/errors/failures';
import {
  validateAuthEmailAndPassword,
  validateAuthName,
} from '@/features/auth/server/domain/usecases/auth-input-validation';

describe('auth-input-validation', () => {
  describe('validateAuthEmailAndPassword', () => {
    it('given an invalid email when validating credentials then it returns an email validation failure', () => {
      const result = validateAuthEmailAndPassword({
        email: 'invalid-email',
        password: '123456',
      });

      expect(result).toBeInstanceOf(ValidationFailure);
      expect(result?.message).toBe(AuthFailureMessages.invalidEmail);
    });

    it('given a short password when validating credentials then it returns a password validation failure', () => {
      const result = validateAuthEmailAndPassword({
        email: 'user@example.com',
        password: '12345',
      });

      expect(result).toBeInstanceOf(ValidationFailure);
      expect(result?.message).toBe(AuthFailureMessages.invalidPassword);
    });

    it('given valid credentials when validating then it returns null', () => {
      const result = validateAuthEmailAndPassword({
        email: 'user@example.com',
        password: '123456',
      });

      expect(result).toBeNull();
    });
  });

  describe('validateAuthName', () => {
    it('given a trimmed name that is too short when validating then it returns a name validation failure', () => {
      const result = validateAuthName('  ab ');

      expect(result).toBeInstanceOf(ValidationFailure);
      expect(result?.message).toBe(AuthFailureMessages.invalidName);
    });

    it('given a valid name when validating then it returns null', () => {
      expect(validateAuthName('Alice')).toBeNull();
    });
  });
});
