const { server } = require("../server");
const config = require("../config");
const connectDB = require('../config/database');
const logger = require('../utils/logger');
const monitoringScheduler = require('../utils/monitoringScheduler');
const alertSystem = require('../utils/alerting');


// Start server after database connection
async function startServer() {
  try {
    await connectDB();

    const PORT = config.port;
    server.listen(PORT, async () => {
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

  setTimeout(() => {
    try {
      monitoringScheduler.start();
    } catch (error) {
      logger.error('Failed to start monitoring scheduler', {
        schedulerEvent: 'SCHEDULER_START_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }, 2000);

  setTimeout(async () => {
    try {
      await alertSystem.sendStartupAlert();
    } catch (error) {
      logger.error('Failed to send startup alert', {
        alertEvent: 'STARTUP_ALERT_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  try {
    // Send shutdown alert
    await alertSystem.sendShutdownAlert();

    // Stop monitoring scheduler
    monitoringScheduler.stop();

    // Close server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');

  try {
    // Send shutdown alert
    await alertSystem.sendShutdownAlert();

    // Stop monitoring scheduler
    monitoringScheduler.stop();

    // Close server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
});

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
}

// Start the server
startServer();
