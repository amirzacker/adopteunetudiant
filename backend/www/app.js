const { server } = require("../server");
const config = require("../config");
const connectDB = require('../config/database');
const logger = require('../utils/logger');


connectDB()


const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);

  // Test Elasticsearch logging integration
  if (config.elasticPassword) {
    logger.info('Elasticsearch logging integration active', {
      indexPrefix: process.env.NODE_ENV === "development" ? "adopte-etudiant-api-dev" :
                   process.env.NODE_ENV === "production" ? "adopte-etudiant-api-prod" :
                   process.env.NODE_ENV === "test" ? "adopte-etudiant-api-test" : "adopte-etudiant-api-local",
      elasticsearchNode: 'http://localhost:9200'
    });
  } else {
    logger.info('Elasticsearch logging not configured - using file and console logging only');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
