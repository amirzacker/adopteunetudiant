/**
 * Utilities for creating structured log metadata
 * Ensures consistent logging format across the application
 */
class LogMetadata {
  
  /**
   * Create user context metadata
   * @param {Object} user - User object from request
   * @returns {Object} Sanitized user metadata
   */
  static createUserContext(user) {
    if (!user) return { userId: null, userType: 'anonymous' };
    
    return {
      userId: user._id,
      userType: user.isStudent ? 'student' : (user.isCompany ? 'company' : 'admin'),
      userEmail: user.email,
      isAdmin: user.isAdmin || false
    };
  }
  
  /**
   * Create request context metadata
   * @param {Object} req - Express request object
   * @returns {Object} Request context metadata
   */
  static createRequestContext(req) {
    return {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      timestamp: new Date().toISOString(),
      ...this.createUserContext(req.user)
    };
  }
  
  /**
   * Create database operation metadata
   * @param {string} operation - Database operation type
   * @param {string} collection - Collection/model name
   * @param {Object} query - Query parameters (sanitized)
   * @param {Object} additionalData - Additional operation data
   * @returns {Object} Database operation metadata
   */
  static createDbContext(operation, collection, query = {}, additionalData = {}) {
    return {
      dbOperation: operation,
      collection,
      queryParams: this.sanitizeQuery(query),
      timestamp: new Date().toISOString(),
      ...additionalData
    };
  }
  
  /**
   * Create authentication event metadata
   * @param {string} event - Authentication event type
   * @param {Object} req - Express request object
   * @param {Object} additionalData - Additional auth data
   * @returns {Object} Authentication event metadata
   */
  static createAuthContext(event, req, additionalData = {}) {
    return {
      authEvent: event,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
      ...additionalData
    };
  }
  
  /**
   * Create business logic metadata
   * @param {string} action - Business action being performed
   * @param {Object} context - Business context
   * @param {Object} req - Express request object
   * @returns {Object} Business logic metadata
   */
  static createBusinessContext(action, context = {}, req = null) {
    const baseContext = {
      businessAction: action,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    if (req) {
      return {
        ...baseContext,
        ...this.createRequestContext(req)
      };
    }
    
    return baseContext;
  }
  
  /**
   * Create error context metadata
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @param {Object} additionalData - Additional error context
   * @returns {Object} Error context metadata
   */
  static createErrorContext(error, req = null, additionalData = {}) {
    const errorContext = {
      errorName: error.name,
      errorMessage: error.message,
      errorStatus: error.status || 500,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    if (req) {
      return {
        ...errorContext,
        ...this.createRequestContext(req)
      };
    }
    
    return errorContext;
  }
  
  /**
   * Sanitize query parameters to remove sensitive data
   * @param {Object} query - Query object to sanitize
   * @returns {Object} Sanitized query object
   */
  static sanitizeQuery(query) {
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...query };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  /**
   * Create file operation metadata
   * @param {string} operation - File operation type
   * @param {Object} fileInfo - File information
   * @param {Object} req - Express request object
   * @returns {Object} File operation metadata
   */
  static createFileContext(operation, fileInfo = {}, req = null) {
    const fileContext = {
      fileOperation: operation,
      fileName: fileInfo.filename,
      fileSize: fileInfo.size,
      mimeType: fileInfo.mimetype,
      timestamp: new Date().toISOString()
    };
    
    if (req) {
      return {
        ...fileContext,
        ...this.createRequestContext(req)
      };
    }
    
    return fileContext;
  }
}

module.exports = LogMetadata;
