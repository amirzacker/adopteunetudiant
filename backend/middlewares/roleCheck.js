const ForbiddenError = require('../utils/errors/forbidden');


const roleCheck = (roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
};

module.exports = roleCheck;
