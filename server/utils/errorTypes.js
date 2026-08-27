export class ApiError extends Error {
  constructor(message, status = 400, code = 'ERROR', details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Not authorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}
