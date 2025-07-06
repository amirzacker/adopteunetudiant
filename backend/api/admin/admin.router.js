const config = require('../../config');
const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
const AdminBroMongoose = require('admin-bro-mongoose');
const adminOptions = require('./admin.options');

AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro(adminOptions);

// Create admin router with proper session handling
const adminRouter = AdminBroExpress.buildAuthenticatedRouter(
    adminBro,
    {
      cookieName: config.cookieName,
      cookiePassword: config.coockiePassword,
      authenticate: async (email, password) => {
        if (email === config.email && password === config.password) {
          return { email, password };
        }
        return null;
      },
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: config.sessionSecret,
    }
);

module.exports = adminRouter;
