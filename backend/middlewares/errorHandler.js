const logger = require('../utils/logger');
const LogMetadata = require('../utils/logMetadata');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Enhanced error logging with comprehensive context
  const errorContext = LogMetadata.createErrorContext(err, req, {
    operation: 'error_handler',
    errorType: err.constructor.name,
    statusCode: status,
    isOperational: err.isOperational || false,
    severity: status >= 500 ? 'critical' : (status >= 400 ? 'warning' : 'info')
  });

  // Log based on error severity
  if (status >= 500) {
    logger.error(`Critical error: ${err.name}: ${err.message}`, errorContext);
  } else if (status >= 400) {
    logger.warn(`Client error: ${err.name}: ${err.message}`, errorContext);
  } else {
    logger.info(`Error handled: ${err.name}: ${err.message}`, errorContext);
  }

  // Log specific error patterns for security monitoring
  if (err.name === 'UnauthorizedError') {
    logger.warn('Unauthorized access attempt', {
      securityEvent: 'UNAUTHORIZED_ACCESS',
      ...errorContext
    });
  } else if (err.name === 'ForbiddenError') {
    logger.warn('Forbidden access attempt', {
      securityEvent: 'FORBIDDEN_ACCESS',
      ...errorContext
    });
  } else if (err.name === 'ValidationError') {
    logger.info('Validation error occurred', {
      validationEvent: 'VALIDATION_FAILED',
      ...errorContext
    });
  }

  // Track error frequency for monitoring
  logger.debug('Error statistics update', {
    errorTracking: 'ERROR_OCCURRED',
    errorName: err.name,
    statusCode: status,
    endpoint: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(status).json({
    error: {
      status,
      message,
      correlationId: req.correlationId,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
