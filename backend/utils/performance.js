const logger = require('./logger');

/**
 * Performance monitoring utilities for tracking operation execution times
 */
class PerformanceTracker {
  
  /**
   * Start timing an operation
   * @param {string} operationName - Name of the operation being timed
   * @param {Object} metadata - Additional metadata for the operation
   * @returns {Object} Timer object with stop method
   */
  static startTimer(operationName, metadata = {}) {
    const startTime = process.hrtime.bigint();
    const startTimestamp = new Date().toISOString();
    
    logger.debug(`Operation started: ${operationName}`, {
      operation: operationName,
      startTime: startTimestamp,
      ...metadata
    });
    
    return {
      stop: (additionalMetadata = {}) => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const endTimestamp = new Date().toISOString();
        
        const logData = {
          operation: operationName,
          duration: `${duration.toFixed(2)}ms`,
          startTime: startTimestamp,
          endTime: endTimestamp,
          ...metadata,
          ...additionalMetadata
        };
        
        // Log based on duration thresholds
        if (duration > 5000) { // > 5 seconds
          logger.warning(`Slow operation detected: ${operationName}`, logData);
        } else if (duration > 1000) { // > 1 second
          logger.info(`Operation completed: ${operationName}`, logData);
        } else {
          logger.debug(`Operation completed: ${operationName}`, logData);
        }
        
        return duration;
      }
    };
  }
  
  /**
   * Measure database query performance
   * @param {string} queryType - Type of database query (find, create, update, delete)
   * @param {string} collection - Collection/model name
   * @param {Object} metadata - Additional query metadata
   */
  static async measureDbQuery(queryType, collection, queryFunction, metadata = {}) {
    const timer = this.startTimer(`DB_${queryType.toUpperCase()}_${collection}`, {
      queryType,
      collection,
      ...metadata
    });
    
    try {
      const result = await queryFunction();
      const duration = timer.stop({
        success: true,
        resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0)
      });
      
      return result;
    } catch (error) {
      timer.stop({
        success: false,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Measure API endpoint performance
   * @param {Object} req - Express request object
   * @param {Function} operation - Async operation to measure
   * @param {string} operationName - Name of the operation
   */
  static async measureApiOperation(req, operation, operationName) {
    const timer = this.startTimer(`API_${operationName}`, {
      correlationId: req.correlationId,
      userId: req.user ? req.user._id : null,
      method: req.method,
      endpoint: req.route ? req.route.path : req.path
    });
    
    try {
      const result = await operation();
      timer.stop({
        success: true,
        statusCode: 200
      });
      return result;
    } catch (error) {
      timer.stop({
        success: false,
        error: error.message,
        statusCode: error.status || 500
      });
      throw error;
    }
  }
}

module.exports = PerformanceTracker;
