module.exports = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  mongoUri:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/adopte-etudiant',

  // Authentication configuration
  secretJwtToken: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '24h',

  // CORS configuration
  frontUrl: process.env.FRONT_URL || 'http://localhost:3000',

  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'session-secret-key',

  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',

  //admin
  email: process.env.ADMIN_EMAIL || 'email@gmail.com',

  password: process.env.ADMIN_PASSWORD || 'mypassword',

  cookieName: process.env.ADMIN_COOKIE_NAME || 'admin-bro-cookie-name',
  coockiePassword:
    process.env.ADMIN_COOKIE_PASSWORD || 'admin-cookie-password',
};
