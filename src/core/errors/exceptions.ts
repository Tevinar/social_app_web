/**
 * Backend error payload normalized from the public HTTP error contract.
 */
export class ServerException extends Error {
  constructor(params: {
    message: string;
    code: string;
    statusCode: number;
    path: string;
    timestamp: Date;
  }) {
    super(params.message);
    this.name = 'ServerException';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.path = params.path;
    this.timestamp = params.timestamp;
  }

  readonly code: string;
  readonly statusCode: number;
  readonly path: string;
  readonly timestamp: Date;
}

/**
 * Malformed or incomplete backend response on a path that was expected to
 * succeed.
 */
export class InvalidResponseException extends Error {
  constructor(params: { message: string; code?: string }) {
    super(params.message);
    this.name = 'InvalidResponseException';
    if (params.code !== undefined) {
      this.code = params.code;
    }
  }

  readonly code?: string;
}

/**
 * Unclassified local exception raised by the client itself.
 */
export class UnexpectedException extends Error {
  /**
   * Creates an `UnexpectedException`.
   */
  constructor(params: { message: string; code?: string }) {
    super(params.message);
    this.name = 'UnexpectedException';
    if (params.code !== undefined) {
      this.code = params.code;
    }
  }

  readonly code?: string;
}

/**
 * Transport-level connectivity failure while attempting to reach the backend.
 */
export class NetworkException extends Error {
  constructor(params: { message: string; code?: string }) {
    super(params.message);
    this.name = 'NetworkException';
    if (params.code !== undefined) {
      this.code = params.code;
    }
  }

  readonly code?: string;
}

/**
 * Local authentication or authorization precondition failure.
 */
export class UnauthorizedException extends Error {
  constructor(params: { message: string; code?: string }) {
    super(params.message);
    this.name = 'UnauthorizedException';
    if (params.code !== undefined) {
      this.code = params.code;
    }
  }

  readonly code?: string;
}
