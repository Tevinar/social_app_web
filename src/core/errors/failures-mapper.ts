import { AuthFailureMessages, CommonFailureMessages } from './failure-messages';
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
    return new NetworkFailure();
  }

  if (error instanceof UnauthorizedException) {
    return new UnauthorizedFailure();
  }

  if (error instanceof InvalidResponseException) {
    return new UnexpectedFailure();
  }

  if (error instanceof ServerException) {
    return mapServerExceptionToFailure(error);
  }

  if (error instanceof UnexpectedException) {
    return new UnexpectedFailure();
  }

  return new UnexpectedFailure();
}

function mapServerExceptionToFailure(error: ServerException): Failure {
  switch (error.code) {
    case 'invalid_credentials':
      return new AuthenticationFailure(AuthFailureMessages.invalidCredentials);

    case 'email_already_in_use':
      return new ValidationFailure(AuthFailureMessages.emailAlreadyInUse);

    case 'invalid_email':
      return new ValidationFailure(AuthFailureMessages.invalidEmail);

    case 'invalid_device_id':
      return new ValidationFailure(AuthFailureMessages.invalidDeviceId);

    case 'invalid_name':
      return new ValidationFailure(AuthFailureMessages.invalidName);

    case 'invalid_new_password':
      return new ValidationFailure(AuthFailureMessages.invalidPassword);

    case 'bad_request':
    case 'validation_error':
      return new ValidationFailure(CommonFailureMessages.invalidRequest);

    case 'invalid_refresh_token':
    case 'invalid_access_token':
    case 'unauthorized':
      return new UnauthorizedFailure();

    case 'forbidden':
      return new ForbiddenFailure();

    case 'not_found':
      return new NotFoundFailure();

    case 'conflict':
      return new ValidationFailure(CommonFailureMessages.conflict);

    default:
      return mapServerExceptionStatusToFailure(error);
  }
}

function mapServerExceptionStatusToFailure(error: ServerException): Failure {
  switch (error.statusCode) {
    case 400:
      return new ValidationFailure(CommonFailureMessages.invalidRequest);

    case 401:
      return new UnauthorizedFailure();

    case 403:
      return new ForbiddenFailure();

    case 404:
      return new NotFoundFailure();

    case 409:
      return new ValidationFailure(CommonFailureMessages.conflict);

    default:
      return new UnexpectedFailure();
  }
}
