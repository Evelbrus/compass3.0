export class ApiError<T = unknown> extends Error {
  public status: number;
  public data?: T;

  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network Error') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export interface ApiErrorResponseBase {
  error?: string;
}

export interface ValidationErrorResponse extends ApiErrorResponseBase {
  error: 'ValidationError';
  fields: {
    [field: string]: string[];
  };
}

export interface AuthenticationErrorResponse extends ApiErrorResponseBase {
  error: 'AuthenticationError';
  message: string;
}

export type ApiErrorResponse =
  | ValidationErrorResponse
  | AuthenticationErrorResponse
  | ApiErrorResponseBase;

export class ValidationApiError extends ApiError<ValidationErrorResponse> {
  constructor(message: string, status: number, data?: ValidationErrorResponse) {
    super(message, status, data);
    this.name = 'ValidationApiError';
    Object.setPrototypeOf(this, ValidationApiError.prototype);
  }
}

export class AuthenticationApiError extends ApiError<AuthenticationErrorResponse> {
  constructor(message: string, status: number, data?: AuthenticationErrorResponse) {
    super(message, status, data);
    this.name = 'AuthenticationApiError';
    Object.setPrototypeOf(this, AuthenticationApiError.prototype);
  }
}
