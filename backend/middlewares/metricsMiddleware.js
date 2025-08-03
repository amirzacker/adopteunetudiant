const metricsCollector = require('../utils/metrics');
const logger = require('../utils/logger');
const LogMetadata = require('../utils/logMetadata');

/**
 * Metrics collection middleware
 * Automatically tracks HTTP request metrics for monitoring
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture metrics when response is sent
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    try {
      // Record metrics
      metricsCollector.recordHttpRequest(method, route, statusCode, duration);

      // Log performance data
      logger.debug('HTTP request metrics recorded', LogMetadata.createRequestContext(req, {
        metricsEvent: 'HTTP_REQUEST_RECORDED',
        duration: `${duration}ms`,
        statusCode,
        route,
        method,
        timestamp: new Date().toISOString()
      }));

      // Check for performance issues and log warnings
      if (duration > 5000) { // 5 seconds
        logger.warn('Slow HTTP request detected', LogMetadata.createRequestContext(req, {
          performanceEvent: 'SLOW_REQUEST',
          duration: `${duration}ms`,
          threshold: '5000ms',
          statusCode,
          route,
          method,
          timestamp: new Date().toISOString()
        }));
      }

      // Check for error responses
      if (statusCode >= 400) {
        logger.info('HTTP error response', LogMetadata.createRequestContext(req, {
          errorEvent: 'HTTP_ERROR_RESPONSE',
          statusCode,
          duration: `${duration}ms`,
          route,
          method,
          timestamp: new Date().toISOString()
        }));
      }

    } catch (error) {
      logger.error('Failed to record HTTP metrics', LogMetadata.createRequestContext(req, {
        metricsEvent: 'METRICS_RECORDING_FAILED',
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }));
    }

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Database operation metrics middleware
 * Can be used to wrap database operations for monitoring
 */
const recordDatabaseOperation = (operation, collection) => {
  return async (next) => {
    const startTime = Date.now();
    
    try {
      const result = await next();
      const duration = Date.now() - startTime;
      
      metricsCollector.recordDatabaseOperation(operation, collection, 'success', duration);
      
      logger.debug('Database operation metrics recorded', {
        metricsEvent: 'DB_OPERATION_RECORDED',
        operation,
        collection,
        status: 'success',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      metricsCollector.recordDatabaseOperation(operation, collection, 'error', duration);
      
      logger.error('Database operation failed', {
        metricsEvent: 'DB_OPERATION_FAILED',
        operation,
        collection,
        status: 'error',
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  };
};

/**
 * Socket.IO metrics tracking
 */
const trackSocketConnection = (socket, users) => {
  try {
    metricsCollector.updateSocketMetrics(users.length);
    
    logger.debug('Socket.IO metrics updated', {
      metricsEvent: 'SOCKET_METRICS_UPDATED',
      activeConnections: users.length,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to update Socket.IO metrics', {
      metricsEvent: 'SOCKET_METRICS_UPDATE_FAILED',
      error: error.message,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Record Socket.IO message metrics
 */
const recordSocketMessage = (eventType) => {
  try {
    metricsCollector.recordSocketMessage(eventType);
    
    logger.debug('Socket.IO message recorded', {
      metricsEvent: 'SOCKET_MESSAGE_RECORDED',
      eventType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to record Socket.IO message', {
      metricsEvent: 'SOCKET_MESSAGE_RECORDING_FAILED',
      error: error.message,
      eventType,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Error rate calculation and tracking
 */
class ErrorRateTracker {
  constructor() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.windowStart = Date.now();
    this.windowSize = 5 * 60 * 1000; // 5 minutes
  }

  recordRequest(isError = false) {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart > this.windowSize) {
      this.requestCount = 0;
      this.errorCount = 0;
      this.windowStart = now;
    }

    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }

    // Update error rate metric
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    metricsCollector.updateErrorRate(errorRate);

    return errorRate;
  }

  getErrorRate() {
    return this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
  }
}

const errorRateTracker = new ErrorRateTracker();

/**
 * Enhanced metrics middleware that also tracks error rates
 */
const enhancedMetricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture metrics when response is sent
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    try {
      // Record HTTP metrics
      metricsCollector.recordHttpRequest(method, route, statusCode, duration);
      
      // Record error rate
      const errorRate = errorRateTracker.recordRequest(isError);

      // Log comprehensive metrics
      logger.debug('Enhanced HTTP metrics recorded', LogMetadata.createRequestContext(req, {
        metricsEvent: 'ENHANCED_HTTP_METRICS_RECORDED',
        duration: `${duration}ms`,
        statusCode,
        route,
        method,
        isError,
        currentErrorRate: `${errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      logger.error('Failed to record enhanced HTTP metrics', LogMetadata.createRequestContext(req, {
        metricsEvent: 'ENHANCED_METRICS_RECORDING_FAILED',
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }));
    }

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

module.exports = {
  metricsMiddleware,
  enhancedMetricsMiddleware,
  recordDatabaseOperation,
  trackSocketConnection,
  recordSocketMessage,
  errorRateTracker
};
