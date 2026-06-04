import { AuthFailureMessages, CommonFailureMessages } from './failure_messages';
import {
  AuthenticationFailure,
  Failure,
  ForbiddenFailure,
  NetworkFailure,
  NotFoundFailure,
  UnauthorizedFailure,
  UnexpectedFailure,
  ValidationFailure,
} from './failures';
import {
  InvalidResponseException,
  NetworkException,
  ServerException,
  UnauthorizedException,
  UnexpectedException,
} from './exceptions';

/**
 * Maps one internal exception into the app-facing `Failure` hierarchy.
 */
export function mapExceptionToFailure(error: unknown): Failure {
  if (error instanceof NetworkException) {
    return new NetworkFailure(error.message);
  }

  if (error instanceof UnauthorizedException) {
    return new UnauthorizedFailure(error.message);
  }

  if (error instanceof InvalidResponseException) {
    return new UnexpectedFailure(error.message);
  }

  if (error instanceof ServerException) {
    return mapServerExceptionToFailure(error);
  }

  if (error instanceof UnexpectedException) {
    return new UnexpectedFailure(error.message);
  }

  return new UnexpectedFailure(
    error instanceof Error ? error.message : String(error),
  );
}

function mapServerExceptionToFailure(error: ServerException): Failure {
  switch (error.code) {
    case 'invalid_credentials':
      return new AuthenticationFailure(
        AuthFailureMessages.invalidCredentials,
        error.message,
      );

    case 'email_already_in_use':
      return new ValidationFailure(
        AuthFailureMessages.emailAlreadyInUse,
        error.message,
      );

    case 'user_already_signed_in_on_device':
      return new AuthenticationFailure(
        AuthFailureMessages.alreadySignedInOnDevice,
        error.message,
      );

    case 'invalid_email':
      return new ValidationFailure(
        AuthFailureMessages.invalidEmail,
        error.message,
      );

    case 'invalid_device_id':
      return new ValidationFailure(
        AuthFailureMessages.invalidDeviceId,
        error.message,
      );

    case 'invalid_name':
      return new ValidationFailure(
        AuthFailureMessages.invalidName,
        error.message,
      );

    case 'invalid_new_password':
      return new ValidationFailure(
        AuthFailureMessages.invalidPassword,
        error.message,
      );

    case 'bad_request':
    case 'validation_error':
      return new ValidationFailure(
        CommonFailureMessages.invalidRequest,
        error.message,
      );

    case 'invalid_refresh_token':
    case 'invalid_access_token':
    case 'unauthorized':
      return new UnauthorizedFailure(error.message);

    case 'forbidden':
      return new ForbiddenFailure(error.message);

    case 'not_found':
      return new NotFoundFailure(error.message);

    case 'conflict':
      return new ValidationFailure(
        CommonFailureMessages.conflict,
        error.message,
      );

    default:
      return mapServerExceptionStatusToFailure(error);
  }
}

function mapServerExceptionStatusToFailure(error: ServerException): Failure {
  switch (error.statusCode) {
    case 400:
      return new ValidationFailure(
        CommonFailureMessages.invalidRequest,
        error.message,
      );

    case 401:
      return new UnauthorizedFailure(error.message);

    case 403:
      return new ForbiddenFailure(error.message);

    case 404:
      return new NotFoundFailure(error.message);

    case 409:
      return new ValidationFailure(
        CommonFailureMessages.conflict,
        error.message,
      );

    default:
      return new UnexpectedFailure(error.message);
  }
}
