/**
 * Base type for recoverable application failures exposed beyond the data
 * layer.
 *
 * A failure is the user-safe representation of an error condition after
 * low-level exceptions have been mapped into something the rest of the app can
 * reason about. Use `message` for UI copy that can be shown directly to the
 * user. Use `debugMessage` for optional diagnostic context that may help with
 * logging or troubleshooting.
 */
export abstract class Failure {
  protected constructor(
    readonly message: string,
    readonly debugMessage?: string,
  ) {}
}

/**
 * Failure raised when the app cannot complete a request because the backend
 * could not be reached reliably.
 *
 * This covers transport-level problems such as timeouts, offline states, DNS
 * failures, and connection errors. It should not be used for valid HTTP
 * responses that contain an application error payload.
 */
export class NetworkFailure extends Failure {
  constructor(debugMessage?: string) {
    super(
      'Unable to reach the server. Check your connection and try again.',
      debugMessage,
    );
  }
}

/**
 * Failure raised when the current authentication state is missing, expired, or
 * otherwise no longer accepted by the backend.
 *
 * This typically means the user must authenticate again before retrying the
 * action.
 */
export class UnauthorizedFailure extends Failure {
  constructor(debugMessage?: string) {
    super('Your session has expired. Please sign in again.', debugMessage);
  }
}

/**
 * Failure raised when the user is authenticated but does not have permission
 * to perform the requested action.
 */
export class ForbiddenFailure extends Failure {
  constructor(debugMessage?: string) {
    super('You do not have permission to perform this action.', debugMessage);
  }
}

/**
 * Failure raised for authentication-specific business rules that should be
 * shown directly to the user.
 *
 * Examples include invalid credentials or account/session constraints that are
 * not generic authorization failures.
 */
export class AuthenticationFailure extends Failure {
  constructor(message: string, debugMessage?: string) {
    super(message, debugMessage);
  }
}

/**
 * Failure raised when user input or request parameters do not satisfy business
 * or transport validation rules.
 *
 * The `message` is expected to be specific enough to help the user correct the
 * invalid input.
 */
export class ValidationFailure extends Failure {
  constructor(message: string, debugMessage?: string) {
    super(message, debugMessage);
  }
}

/**
 * Failure raised when the requested resource does not exist or is no longer
 * accessible by identifier.
 */
export class NotFoundFailure extends Failure {
  constructor(debugMessage?: string) {
    super('Requested resource not found.', debugMessage);
  }
}

/**
 * Failure raised when an operation fails in a way the app does not classify
 * more specifically.
 *
 * This is the broad fallback for unrecognized backend responses, unexpected
 * local exceptions, or any condition that should not leak internal details to
 * the user.
 */
export class UnexpectedFailure extends Failure {
  constructor(debugMessage?: string) {
    super('Something went wrong. Please try again.', debugMessage);
  }
}
