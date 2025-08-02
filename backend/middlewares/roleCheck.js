const ForbiddenError = require('../utils/errors/forbidden');
const logger = require('../utils/logger');
const LogMetadata = require('../utils/logMetadata');

const roleCheck = (roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    logger.debug('Role authorization check initiated',
      LogMetadata.createAuthContext('ROLE_CHECK', req, {
        requiredRoles: allowedRoles,
        userRole: req.user ? req.user.role : null,
        endpoint: req.path
      })
    );

    if (!req.user) {
      logger.warn('Authorization failed: No user in request',
        LogMetadata.createAuthContext('ROLE_CHECK_NO_USER', req, {
          requiredRoles: allowedRoles,
          endpoint: req.path
        })
      );
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions',
        LogMetadata.createAuthContext('ROLE_CHECK_FAILED', req, {
          requiredRoles: allowedRoles,
          userRole: req.user.role,
          userId: req.user._id,
          endpoint: req.path
        })
      );
      return next(new ForbiddenError('Insufficient permissions'));
    }

    logger.debug('Role authorization successful',
      LogMetadata.createAuthContext('ROLE_CHECK_SUCCESS', req, {
        requiredRoles: allowedRoles,
        userRole: req.user.role,
        userId: req.user._id,
        endpoint: req.path
      })
    );

    next();
  };
};

module.exports = roleCheck;
