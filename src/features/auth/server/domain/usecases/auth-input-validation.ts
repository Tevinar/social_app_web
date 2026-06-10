import 'server-only';

import { AuthFailureMessages } from '@/core/errors/failure_messages';
import { ValidationFailure } from '@/core/errors/failures';

const MINIMUM_PASSWORD_LENGTH = 6;
const MINIMUM_NAME_LENGTH = 3;
const MAXIMUM_EMAIL_LENGTH = 254;

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
  if (!isValidEmail(params.email)) {
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

function isValidEmail(email: string): boolean {
  if (email.length === 0 || email.length > MAXIMUM_EMAIL_LENGTH) {
    return false;
  }

  if (email.includes(' ')) {
    return false;
  }

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex !== email.lastIndexOf('@')) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (localPart.length === 0 || domainPart.length === 0) {
    return false;
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }

  const domainLabels = domainPart.split('.');
  if (domainLabels.length < 2) {
    return false;
  }

  return domainLabels.every((label) => label.length > 0);
}
