class NotFoundError extends Error {
  constructor(message) {
    super(message);

    this.status = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);

    this.status = 401;
  }
}

class CoflictError extends Error {
  constructor(message) {
    super(message);

    this.status = 409;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);

    this.status = 400;
  }
}

module.exports = {
  NotFoundError,
  UnauthorizedError,
  CoflictError,
  ValidationError,
};
