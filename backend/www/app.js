const { server } = require("../server");
const config = require("../config");
const connectDB = require('../config/database');
const logger = require('../utils/logger');


connectDB()


const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
