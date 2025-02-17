export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
export class NetworkError extends Error {
    constructor(message = 'Network Error') {
        super(message);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
export class ValidationApiError extends ApiError {
    constructor(message, status, data) {
        super(message, status, data);
        this.name = 'ValidationApiError';
        Object.setPrototypeOf(this, ValidationApiError.prototype);
    }
}
export class AuthenticationApiError extends ApiError {
    constructor(message, status, data) {
        super(message, status, data);
        this.name = 'AuthenticationApiError';
        Object.setPrototypeOf(this, AuthenticationApiError.prototype);
    }
}
