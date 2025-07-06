class ValidationError extends Error {
  constructor(message = 'Validation failed', errors = {}) {
    super(message);
    this.status = 400;
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

module.exports = ValidationError;