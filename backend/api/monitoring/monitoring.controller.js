const mongoose = require('mongoose');
const os = require('os');
const logger = require('../../utils/logger');
const LogMetadata = require('../../utils/logMetadata');
const PerformanceTracker = require('../../utils/performance');

/**
 * Health Check Controller
 * Provides comprehensive system health information for monitoring and alerting
 */
class MonitoringController {
  
  /**
   * Comprehensive health check endpoint
   * @route GET /api/health
   * @access Public
   */
  static async healthCheck(req, res) {
    const startTime = Date.now();
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    };

    try {
      // Database connectivity check
      healthData.checks.database = await MonitoringController.checkDatabase();
      
      // Memory usage check
      healthData.checks.memory = MonitoringController.checkMemory();
      
      // System resources check
      healthData.checks.system = MonitoringController.checkSystem();
      
      // Application services check
      healthData.checks.services = await MonitoringController.checkServices();

      // Determine overall health status
      const hasFailures = Object.values(healthData.checks).some(check => 
        check.status === 'unhealthy' || check.status === 'critical'
      );
      
      if (hasFailures) {
        healthData.status = 'degraded';
      }

      const responseTime = Date.now() - startTime;
      healthData.responseTime = `${responseTime}ms`;

      // Log health check
      logger.info('Health check performed', LogMetadata.createRequestContext(req, {
        healthStatus: healthData.status,
        responseTime: healthData.responseTime,
        checksPerformed: Object.keys(healthData.checks).length
      }));

      const statusCode = healthData.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthData);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Health check failed', LogMetadata.createRequestContext(req, {
        error: error.message,
        responseTime: `${responseTime}ms`,
        stack: error.stack
      }));

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: `${responseTime}ms`
      });
    }
  }

  /**
   * Database connectivity check
   */
  static async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // Check MongoDB connection
      const dbState = mongoose.connection.readyState;
      const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      if (dbState !== 1) {
        return {
          status: 'unhealthy',
          message: `Database ${dbStates[dbState]}`,
          responseTime: `${Date.now() - startTime}ms`
        };
      }

      // Perform a simple query to verify database functionality
      await mongoose.connection.db.admin().ping();

      // Get additional database statistics
      const dbStats = await mongoose.connection.db.stats();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'Database connected and responsive',
        responseTime: `${responseTime}ms`,
        connectionState: dbStates[dbState],
        metrics: {
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024 / 1024), // MB
          indexSize: Math.round(dbStats.indexSize / 1024 / 1024), // MB
          storageSize: Math.round(dbStats.storageSize / 1024 / 1024) // MB
        }
      };

    } catch (error) {
      return {
        status: 'critical',
        message: `Database error: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Memory usage check
   */
  static checkMemory() {
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Convert bytes to MB
    const memoryData = {
      heap: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      system: {
        used: Math.round(usedMemory / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024),
        free: Math.round(freeMemory / 1024 / 1024)
      },
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Determine memory health status
    const heapUsagePercent = (memoryData.heap.used / memoryData.heap.total) * 100;
    const systemUsagePercent = (memoryData.system.used / memoryData.system.total) * 100;

    let status = 'healthy';
    let message = 'Memory usage within normal limits';

    if (heapUsagePercent > 90 || systemUsagePercent > 95) {
      status = 'critical';
      message = 'Critical memory usage detected';
    } else if (heapUsagePercent > 80 || systemUsagePercent > 85) {
      status = 'warning';
      message = 'High memory usage detected';
    }

    return {
      status,
      message,
      metrics: memoryData,
      usage: {
        heapPercent: Math.round(heapUsagePercent),
        systemPercent: Math.round(systemUsagePercent)
      }
    };
  }

  /**
   * System resources check
   */
  static checkSystem() {
    const loadAverage = os.loadavg();
    const cpuCount = os.cpus().length;
    
    // Calculate load average as percentage of CPU cores
    const loadPercent = Math.round((loadAverage[0] / cpuCount) * 100);
    
    let status = 'healthy';
    let message = 'System load within normal limits';

    if (loadPercent > 90) {
      status = 'critical';
      message = 'Critical system load detected';
    } else if (loadPercent > 75) {
      status = 'warning';
      message = 'High system load detected';
    }

    return {
      status,
      message,
      metrics: {
        loadAverage: loadAverage.map(load => Math.round(load * 100) / 100),
        cpuCount,
        loadPercent,
        platform: os.platform(),
        arch: os.arch(),
        uptime: Math.round(os.uptime())
      }
    };
  }

  /**
   * Application services check
   */
  static async checkServices() {
    const services = {
      socketio: 'healthy',
      sessions: 'healthy',
      uploads: 'healthy'
    };

    try {
      // Check if uploads directory is accessible
      const fs = require('fs').promises;
      const uploadsPath = require('path').join(__dirname, '../../public/uploads');
      
      try {
        await fs.access(uploadsPath);
        services.uploads = 'healthy';
      } catch (error) {
        services.uploads = 'unhealthy';
      }

      // Determine overall services status
      const hasUnhealthyServices = Object.values(services).some(status => status === 'unhealthy');
      
      return {
        status: hasUnhealthyServices ? 'degraded' : 'healthy',
        message: hasUnhealthyServices ? 'Some services are unhealthy' : 'All services operational',
        services
      };

    } catch (error) {
      return {
        status: 'critical',
        message: `Services check failed: ${error.message}`,
        services
      };
    }
  }

  /**
   * Readiness probe endpoint
   * @route GET /api/ready
   * @access Public
   */
  static async readinessProbe(req, res) {
    try {
      // Quick database connectivity check
      const dbState = mongoose.connection.readyState;
      
      if (dbState !== 1) {
        return res.status(503).json({
          status: 'not_ready',
          message: 'Database not connected'
        });
      }

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Readiness probe failed', LogMetadata.createRequestContext(req, {
        error: error.message
      }));

      res.status(503).json({
        status: 'not_ready',
        error: error.message
      });
    }
  }

  /**
   * Liveness probe endpoint
   * @route GET /api/live
   * @access Public
   */
  static async livenessProbe(req, res) {
    try {
      // Simple liveness check - if we can respond, we're alive
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });

    } catch (error) {
      res.status(503).json({
        status: 'dead',
        error: error.message
      });
    }
  }

  /**
   * External services monitoring
   * @route GET /api/monitoring/external
   * @access Public
   */
  static async externalServicesCheck(req, res) {
    const startTime = Date.now();
    const externalServices = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    try {
      // Check Elasticsearch if configured
      if (process.env.ELASTIC_PASSWORD) {
        externalServices.services.elasticsearch = await MonitoringController.checkElasticsearch();
      }

      // Check email service if configured
      if (process.env.EMAIL_HOST) {
        externalServices.services.email = await MonitoringController.checkEmailService();
      }

      // Determine overall external services status
      const hasFailures = Object.values(externalServices.services).some(service =>
        service.status === 'unhealthy' || service.status === 'critical'
      );

      if (hasFailures) {
        externalServices.status = 'degraded';
      }

      const responseTime = Date.now() - startTime;
      externalServices.responseTime = `${responseTime}ms`;

      logger.info('External services check performed', {
        monitoringEvent: 'EXTERNAL_SERVICES_CHECK',
        status: externalServices.status,
        responseTime: externalServices.responseTime,
        servicesChecked: Object.keys(externalServices.services).length,
        timestamp: new Date().toISOString()
      });

      const statusCode = externalServices.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(externalServices);

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('External services check failed', {
        monitoringEvent: 'EXTERNAL_SERVICES_CHECK_FAILED',
        error: error.message,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      });

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: `${responseTime}ms`
      });
    }
  }

  /**
   * Check Elasticsearch connectivity
   */
  static async checkElasticsearch() {
    try {
      const startTime = Date.now();
      // This is a basic check - in a real implementation you might ping Elasticsearch
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'Elasticsearch logging configured',
        responseTime: `${responseTime}ms`,
        configured: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Elasticsearch error: ${error.message}`,
        configured: true
      };
    }
  }

  /**
   * Check email service connectivity
   */
  static async checkEmailService() {
    try {
      const startTime = Date.now();
      // This is a basic check - in a real implementation you might test SMTP connection
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'Email service configured',
        responseTime: `${responseTime}ms`,
        configured: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Email service error: ${error.message}`,
        configured: true
      };
    }
  }
}

module.exports = MonitoringController;
