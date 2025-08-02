const {UnauthorizedError } = require('../utils/errors/');
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../api/users/users.model");
const logger = require('../utils/logger');
const LogMetadata = require('../utils/logMetadata');

module.exports = async (req, res, next) =>  {
  const startTime = Date.now();

  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      logger.warn('Authentication failed: No token provided',
        LogMetadata.createAuthContext('TOKEN_MISSING', req)
      );
      throw "not token";
    }

    const decoded = jwt.verify(token, config.secretJwtToken);
    const userId = decoded.userId;

    logger.debug('JWT token decoded successfully',
      LogMetadata.createAuthContext('TOKEN_DECODED', req, { userId })
    );

    const user = await User.findById(userId, "-password");

    if (!user) {
      logger.warn('Authentication failed: User not found',
        LogMetadata.createAuthContext('USER_NOT_FOUND', req, { userId })
      );
      throw new UnauthorizedError('User not found');
    }

    req.user = user;

    const authTime = Date.now() - startTime;
    logger.info('User authenticated successfully',
      LogMetadata.createAuthContext('AUTH_SUCCESS', req, {
        userId: user._id,
        userType: user.isStudent ? 'student' : (user.isCompany ? 'company' : 'admin'),
        authTime: `${authTime}ms`
      })
    );

    next();
  } catch (error) {
    const authTime = Date.now() - startTime;

    if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired',
        LogMetadata.createAuthContext('TOKEN_EXPIRED', req, { authTime: `${authTime}ms` })
      );
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed: Invalid token',
        LogMetadata.createAuthContext('TOKEN_INVALID', req, { authTime: `${authTime}ms` })
      );
    } else {
      logger.error('Authentication error',
        LogMetadata.createAuthContext('AUTH_ERROR', req, {
          error: error.message,
          authTime: `${authTime}ms`
        })
      );
    }

    next(new UnauthorizedError(error.message || error));
  }
};
