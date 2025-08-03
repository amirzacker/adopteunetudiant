const logger = require('./logger');
const os = require('os');

/**
 * ELK Stack Metrics Collection System
 * Provides comprehensive application metrics for monitoring via Elasticsearch/Kibana
 * Integrates with existing Winston + Elasticsearch logging infrastructure
 */
class MetricsCollector {
  constructor() {
    this.metricsBuffer = new Map();
    this.systemMetricsInterval = null;
    this.errorRateTracker = {
      totalRequests: 0,
      errorRequests: 0,
      currentErrorRate: 0
    };
    this.initializeMetricsCollection();
  }

  /**
   * Initialize metrics collection system for ELK stack
   */
  initializeMetricsCollection() {
    // Start system metrics collection
    this.startSystemMetricsCollection();

    logger.info('ELK Stack metrics collection initialized', {
      metricsEvent: 'METRICS_INITIALIZED',
      system: 'ELK_STACK',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Start collecting system metrics periodically
   */
  startSystemMetricsCollection() {
    // Collect system metrics every 30 seconds
    this.systemMetricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Collect initial metrics
    this.collectSystemMetrics();
  }

  /**
   * Collect system metrics and send to ELK stack
   */
  collectSystemMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        cpu: {
          usage: process.cpuUsage(),
          loadAverage: os.loadavg()
        },
        memory: {
          usage: process.memoryUsage(),
          total: os.totalmem(),
          free: os.freemem()
        },
        uptime: {
          process: process.uptime(),
          system: os.uptime()
        }
      }
    };

    this.sendMetricsToELK('system_metrics', metrics);
  }

  /**
   * Send metrics data to ELK stack via Winston + Elasticsearch
   */
  sendMetricsToELK(metricType, data) {
    logger.info('Application metrics', {
      metricType,
      metricData: data,
      service: 'adopte-etudiant-api',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(method, route, statusCode, duration) {
    // Update error rate tracking
    this.errorRateTracker.totalRequests++;
    if (statusCode >= 400) {
      this.errorRateTracker.errorRequests++;
    }

    // Calculate current error rate
    this.errorRateTracker.currentErrorRate =
      (this.errorRateTracker.errorRequests / this.errorRateTracker.totalRequests) * 100;

    const metrics = {
      http: {
        method,
        route,
        statusCode,
        duration,
        isError: statusCode >= 400,
        timestamp: new Date().toISOString()
      }
    };

    this.sendMetricsToELK('http_request', metrics);
  }

  /**
   * Record database operation metrics
   */
  recordDatabaseOperation(operation, collection, status, duration) {
    const metrics = {
      database: {
        operation,
        collection,
        status,
        duration,
        timestamp: new Date().toISOString()
      }
    };

    this.sendMetricsToELK('database_operation', metrics);
  }

  /**
   * Record business metrics
   */
  recordBusinessMetrics(type, data) {
    const metrics = {
      business: {
        type,
        data,
        timestamp: new Date().toISOString()
      }
    };

    this.sendMetricsToELK('business_metrics', metrics);
  }
  /**
   * Record health check metrics
   */
  recordHealthCheck(checkType, status) {
    const metrics = {
      healthCheck: {
        checkType,
        status: status ? 1 : 0,
        timestamp: new Date().toISOString()
      }
    };

    this.sendMetricsToELK('health_check', metrics);
  }

  /**
   * Record Socket.IO metrics
   */
  recordSocketMetrics(eventType, connectionCount) {
    const metrics = {
      socket: {
        eventType,
        connectionCount,
        timestamp: new Date().toISOString()
      }
    };

    this.sendMetricsToELK('socket_metrics', metrics);
  }

  /**
   * Record error metrics
   */
  recordError(errorType, errorMessage, stackTrace) {
    const metrics = {
      error: {
        type: errorType,
        message: errorMessage,
        stack: stackTrace,
        timestamp: new Date().toISOString()
      }
    };

    this.sendMetricsToELK('error_metrics', metrics);
  }

  /**
   * Update business metrics and send to ELK stack
   */
  async updateBusinessMetrics() {
    try {
      const User = require('../api/users/users.model');
      const JobOffer = require('../api/jobOffers/jobOffers.model');
      const JobApplication = require('../api/jobApplications/jobApplications.model');
      const Adoption = require('../api/adoptions/adoptions.model');

      // Collect user counts
      const studentCount = await User.countDocuments({ isStudent: true });
      const companyCount = await User.countDocuments({ isCompany: true });

      // Collect job offer counts
      const activeJobOffers = await JobOffer.countDocuments({ status: 'active' });
      const expiredJobOffers = await JobOffer.countDocuments({ status: 'expired' });
      const draftJobOffers = await JobOffer.countDocuments({ status: 'draft' });

      // Collect application counts
      const pendingApplications = await JobApplication.countDocuments({ status: 'pending' });
      const acceptedApplications = await JobApplication.countDocuments({ status: 'accepted' });
      const rejectedApplications = await JobApplication.countDocuments({ status: 'rejected' });

      // Collect adoption counts
      const activeAdoptions = await Adoption.countDocuments({ status: 'active' });
      const completedAdoptions = await Adoption.countDocuments({ status: 'completed' });
      const cancelledAdoptions = await Adoption.countDocuments({ status: 'cancelled' });

      // Send comprehensive business metrics to ELK stack
      const businessMetrics = {
        users: {
          students: studentCount,
          companies: companyCount,
          total: studentCount + companyCount
        },
        jobOffers: {
          active: activeJobOffers,
          expired: expiredJobOffers,
          draft: draftJobOffers,
          total: activeJobOffers + expiredJobOffers + draftJobOffers
        },
        applications: {
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
          total: pendingApplications + acceptedApplications + rejectedApplications
        },
        adoptions: {
          active: activeAdoptions,
          completed: completedAdoptions,
          cancelled: cancelledAdoptions,
          total: activeAdoptions + completedAdoptions + cancelledAdoptions
        },
        timestamp: new Date().toISOString()
      };

      this.sendMetricsToELK('business_metrics_summary', businessMetrics);

    } catch (error) {
      logger.error('Failed to update business metrics', {
        metricsEvent: 'BUSINESS_METRICS_UPDATE_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update health check metrics and send to ELK stack
   */
  updateHealthMetrics(healthData) {
    try {
      if (healthData.checks) {
        const healthMetrics = {
          checks: {},
          overallStatus: healthData.status,
          timestamp: new Date().toISOString()
        };

        Object.entries(healthData.checks).forEach(([checkType, checkResult]) => {
          healthMetrics.checks[checkType] = {
            status: checkResult.status,
            healthy: checkResult.status === 'healthy',
            details: checkResult.details || {}
          };
        });

        this.sendMetricsToELK('health_metrics', healthMetrics);
      }
    } catch (error) {
      logger.error('Failed to update health metrics', {
        metricsEvent: 'HEALTH_METRICS_UPDATE_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update Socket.IO metrics and send to ELK stack
   */
  updateSocketMetrics(activeConnections, eventType = 'connection_update') {
    const socketMetrics = {
      activeConnections,
      eventType,
      timestamp: new Date().toISOString()
    };

    this.sendMetricsToELK('socket_metrics', socketMetrics);
  }

  /**
   * Record Socket.IO message and send to ELK stack
   */
  recordSocketMessage(eventType, messageData = {}) {
    const messageMetrics = {
      eventType,
      messageData,
      timestamp: new Date().toISOString()
    };

    this.sendMetricsToELK('socket_message', messageMetrics);
  }

  /**
   * Update error rate metric and send to ELK stack
   */
  updateErrorRate(errorRate, errorDetails = {}) {
    this.errorRateTracker.currentErrorRate = errorRate;

    const errorMetrics = {
      errorRate,
      errorDetails,
      timestamp: new Date().toISOString()
    };

    this.sendMetricsToELK('error_rate', errorMetrics);
  }

  /**
   * Reset error rate tracking (called periodically to prevent stale data)
   */
  resetErrorRateTracking() {
    this.errorRateTracker = {
      totalRequests: 0,
      errorRequests: 0,
      currentErrorRate: 0
    };

    logger.debug('Error rate tracking reset', {
      metricsEvent: 'ERROR_RATE_RESET',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get comprehensive metrics summary for ELK stack
   */
  async getMetrics() {
    try {
      // Update business metrics before returning
      await this.updateBusinessMetrics();

      const metricsSnapshot = {
        timestamp: new Date().toISOString(),
        service: 'adopte-etudiant-api',
        type: 'metrics_snapshot'
      };

      this.sendMetricsToELK('metrics_snapshot', metricsSnapshot);
      return metricsSnapshot;
    } catch (error) {
      logger.error('Failed to get metrics', {
        metricsEvent: 'METRICS_COLLECTION_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get metrics summary for internal use (compatible with alert checks)
   */
  async getMetricsJson() {
    try {
      // Return metrics in a format compatible with alert checks
      const metrics = [
        {
          name: 'adopte_etudiant_error_rate',
          values: [
            {
              value: this.errorRateTracker.currentErrorRate,
              timestamp: new Date().toISOString()
            }
          ],
          metadata: {
            totalRequests: this.errorRateTracker.totalRequests,
            errorRequests: this.errorRateTracker.errorRequests
          }
        },
        {
          name: 'adopte_etudiant_system_metrics',
          values: [
            {
              value: this.getSystemMetrics(),
              timestamp: new Date().toISOString()
            }
          ]
        }
      ];

      return metrics;
    } catch (error) {
      logger.error('Failed to get metrics as JSON', {
        metricsEvent: 'METRICS_JSON_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get current system metrics
   */
  getSystemMetrics() {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Stop metrics collection and cleanup
   */
  stop() {
    if (this.systemMetricsInterval) {
      clearInterval(this.systemMetricsInterval);
      this.systemMetricsInterval = null;
    }

    logger.info('ELK Stack metrics collection stopped', {
      metricsEvent: 'METRICS_STOPPED',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Reset metrics buffer (useful for testing)
   */
  reset() {
    this.metricsBuffer.clear();
    logger.info('ELK Stack metrics buffer reset', {
      metricsEvent: 'METRICS_RESET',
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;
