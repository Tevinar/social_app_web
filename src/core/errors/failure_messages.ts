// Client-owned user-facing failure messages shared across local validation and
// backend error mapping.
//
// Centralizing these strings keeps the UX consistent when the same business
// rule can be enforced locally before a request or remotely by the backend.

export const CommonFailureMessages = {
  invalidRequest: 'The submitted data is invalid. Please review and try again.',
  conflict: 'This request conflicts with existing data. Please try again.',
} as const;

export const AuthFailureMessages = {
  invalidEmail: 'Please enter a valid email address.',
  invalidPassword: 'Password must be at least 6 characters long.',
  invalidCredentials: 'Invalid email or password.',
  emailAlreadyInUse: 'Email already in use.',
  invalidName: 'Please enter a valid name.',
  invalidDeviceId: 'Unable to validate this device. Please try again.',
} as const;
