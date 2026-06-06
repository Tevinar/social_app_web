import 'server-only';

import { AuthFailureMessages } from '@/core/errors/failure_messages';
import { ValidationFailure } from '@/core/errors/failures';

const MINIMUM_PASSWORD_LENGTH = 6;
const MINIMUM_NAME_LENGTH = 3;
const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

/**
 * Validates email/password credentials before calling auth repositories.
 *
 * Returns a `ValidationFailure` when the email format is invalid or the
 * password is shorter than the minimum accepted length. Returns `null` when
 * both values pass local validation.
 */
export function validateAuthEmailAndPassword(params: {
  email: string;
  password: string;
}): ValidationFailure | null {
  if (!EMAIL_REGEXP.test(params.email)) {
    return new ValidationFailure(AuthFailureMessages.invalidEmail);
  }

  if (params.password.length < MINIMUM_PASSWORD_LENGTH) {
    return new ValidationFailure(AuthFailureMessages.invalidPassword);
  }

  return null;
}

/**
 * Validates the submitted sign-up display name.
 */
export function validateAuthName(name: string): ValidationFailure | null {
  if (name.trim().length < MINIMUM_NAME_LENGTH) {
    return new ValidationFailure(AuthFailureMessages.invalidName);
  }

  return null;
}
