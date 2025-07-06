const NotFoundError = require('./not-found');
const UnauthorizedError = require('./unauthorized');
const ForbiddenError = require('./forbidden');
const ValidationError = require('./validation');

module.exports = {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
};