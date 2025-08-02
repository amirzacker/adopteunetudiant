const config = require('../../config');
const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
const AdminBroMongoose = require('admin-bro-mongoose');
const adminOptions = require('./admin.options');
const logger = require('../../utils/logger');
const LogMetadata = require('../../utils/logMetadata');

AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro(adminOptions);

// Enhanced authenticate function with logging
const authenticateWithLogging = async (email, password, req) => {
  const startTime = Date.now();

  logger.info('Admin login attempt initiated', {
    authEvent: 'ADMIN_LOGIN_ATTEMPT',
    email: email ? email.substring(0, 3) + '***' : 'missing',
    ip: req ? (req.ip || req.connection.remoteAddress) : 'unknown',
    userAgent: req ? req.get('User-Agent') : 'unknown',
    timestamp: new Date().toISOString()
  });

  try {
    if (email === config.email && password === config.password) {
      const authTime = Date.now() - startTime;

      logger.info('Admin login successful', {
        authEvent: 'ADMIN_LOGIN_SUCCESS',
        email: email.substring(0, 3) + '***',
        ip: req ? (req.ip || req.connection.remoteAddress) : 'unknown',
        authTime: `${authTime}ms`,
        timestamp: new Date().toISOString()
      });

      return { email, password };
    }

    const authTime = Date.now() - startTime;
    logger.warn('Admin login failed: Invalid credentials', {
      authEvent: 'ADMIN_LOGIN_FAILED',
      email: email ? email.substring(0, 3) + '***' : 'missing',
      ip: req ? (req.ip || req.connection.remoteAddress) : 'unknown',
      authTime: `${authTime}ms`,
      timestamp: new Date().toISOString()
    });

    return null;
  } catch (error) {
    const authTime = Date.now() - startTime;

    logger.error('Admin login error', {
      authEvent: 'ADMIN_LOGIN_ERROR',
      email: email ? email.substring(0, 3) + '***' : 'missing',
      error: error.message,
      authTime: `${authTime}ms`,
      timestamp: new Date().toISOString()
    });

    return null;
  }
};

// Create admin router with proper session handling and logging
const adminRouter = AdminBroExpress.buildAuthenticatedRouter(
    adminBro,
    {
      cookieName: config.cookieName,
      cookiePassword: config.coockiePassword,
      authenticate: authenticateWithLogging,
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: config.sessionSecret,
    }
);

module.exports = adminRouter;
