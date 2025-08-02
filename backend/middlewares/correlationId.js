const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Middleware to generate and attach correlation ID to requests
 * Enables request tracking across the entire application lifecycle
 */
const correlationIdMiddleware = (req, res, next) => {
  // Generate unique correlation ID for this request
  const correlationId = uuidv4();
  
  // Attach to request object for use throughout the request lifecycle
  req.correlationId = correlationId;
  
  // Add to response headers for client-side tracking
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Log incoming request with correlation ID
  logger.http('Incoming HTTP request', {
    correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString()
  });
  
  // Track request start time for performance monitoring
  req.startTime = Date.now();
  
  // Override res.json to log response details
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - req.startTime;
    
    logger.http('HTTP response sent', {
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: JSON.stringify(data).length,
      timestamp: new Date().toISOString()
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = correlationIdMiddleware;
