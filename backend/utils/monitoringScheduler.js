const cron = require('node-cron');
const logger = require('./logger');
const alertSystem = require('./alerting');
const metricsCollector = require('./metrics');
const MonitoringController = require('../api/monitoring/monitoring.controller');
const monitoringConfig = require('../config/monitoring');

/**
 * Monitoring Scheduler
 * Handles scheduled monitoring tasks and automated health checks
 */
class MonitoringScheduler {
  constructor() {
    this.tasks = new Map();
    this.isRunning = false;
  }

  /**
   * Start all monitoring tasks
   */
  start() {
    if (this.isRunning) {
      logger.warn('Monitoring scheduler already running', {
        schedulerEvent: 'ALREADY_RUNNING',
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.isRunning = true;

    // Schedule health checks every 30 seconds
    this.scheduleHealthChecks();
    
    // Schedule business metrics updates every 5 minutes
    this.scheduleBusinessMetricsUpdate();
    
    // Schedule alert threshold checks every minute
    this.scheduleAlertChecks();
    
    // Schedule cleanup tasks daily
    this.scheduleCleanupTasks();

    logger.info('Monitoring scheduler started', {
      schedulerEvent: 'SCHEDULER_STARTED',
      tasksScheduled: this.tasks.size,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Stop all monitoring tasks
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.tasks.forEach((task, name) => {
      task.stop();
      logger.debug('Monitoring task stopped', {
        schedulerEvent: 'TASK_STOPPED',
        taskName: name,
        timestamp: new Date().toISOString()
      });
    });

    this.tasks.clear();
    this.isRunning = false;

    logger.info('Monitoring scheduler stopped', {
      schedulerEvent: 'SCHEDULER_STOPPED',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Schedule health checks
   */
  scheduleHealthChecks() {
    const task = cron.schedule('*/30 * * * * *', async () => { // Every 30 seconds
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Scheduled health check failed', {
          schedulerEvent: 'HEALTH_CHECK_FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, {
      scheduled: false
    });

    this.tasks.set('healthCheck', task);
    task.start();

    logger.info('Health check task scheduled', {
      schedulerEvent: 'HEALTH_CHECK_SCHEDULED',
      interval: '30 seconds',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Schedule business metrics updates
   */
  scheduleBusinessMetricsUpdate() {
    const task = cron.schedule('*/5 * * * *', async () => { // Every 5 minutes
      try {
        await metricsCollector.updateBusinessMetrics();
        
        logger.debug('Business metrics updated', {
          schedulerEvent: 'BUSINESS_METRICS_UPDATED',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Business metrics update failed', {
          schedulerEvent: 'BUSINESS_METRICS_UPDATE_FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, {
      scheduled: false
    });

    this.tasks.set('businessMetrics', task);
    task.start();

    logger.info('Business metrics task scheduled', {
      schedulerEvent: 'BUSINESS_METRICS_SCHEDULED',
      interval: '5 minutes',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Schedule alert threshold checks
   */
  scheduleAlertChecks() {
    const task = cron.schedule('* * * * *', async () => { // Every minute
      try {
        await this.performAlertChecks();
      } catch (error) {
        logger.error('Alert check failed', {
          schedulerEvent: 'ALERT_CHECK_FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, {
      scheduled: false
    });

    this.tasks.set('alertChecks', task);
    task.start();

    logger.info('Alert checks task scheduled', {
      schedulerEvent: 'ALERT_CHECKS_SCHEDULED',
      interval: '1 minute',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Schedule cleanup tasks
   */
  scheduleCleanupTasks() {
    const task = cron.schedule('0 2 * * *', async () => { // Daily at 2 AM
      try {
        await this.performCleanupTasks();
      } catch (error) {
        logger.error('Cleanup tasks failed', {
          schedulerEvent: 'CLEANUP_FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, {
      scheduled: false
    });

    this.tasks.set('cleanup', task);
    task.start();

    logger.info('Cleanup task scheduled', {
      schedulerEvent: 'CLEANUP_SCHEDULED',
      interval: 'daily at 2 AM',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Perform automated health check
   */
  async performHealthCheck() {
    try {
      const healthData = {
        timestamp: new Date().toISOString(),
        checks: {}
      };

      // Perform health checks
      healthData.checks.database = await MonitoringController.checkDatabase();
      healthData.checks.memory = MonitoringController.checkMemory();
      healthData.checks.system = MonitoringController.checkSystem();
      healthData.checks.services = await MonitoringController.checkServices();

      // Update health metrics
      metricsCollector.updateHealthMetrics(healthData);

      // Check for alerts
      await alertSystem.checkAndAlert(healthData);

      logger.debug('Automated health check completed', {
        schedulerEvent: 'HEALTH_CHECK_COMPLETED',
        overallStatus: this.determineOverallHealth(healthData.checks),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Automated health check error', {
        schedulerEvent: 'HEALTH_CHECK_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Perform alert threshold checks
   */
  async performAlertChecks() {
    try {
      // Get current metrics
      const metrics = await metricsCollector.getMetricsJson();

      // Validate metrics format
      if (!Array.isArray(metrics)) {
        throw new Error('Metrics should be an array');
      }

      // Check error rate
      const errorRateMetric = metrics.find(m => m.name === 'adopte_etudiant_error_rate');
      if (errorRateMetric && errorRateMetric.values && errorRateMetric.values.length > 0) {
        const errorRate = errorRateMetric.values[0].value;

        logger.debug('Error rate check', {
          schedulerEvent: 'ERROR_RATE_CHECK',
          errorRate: errorRate.toFixed(2),
          criticalThreshold: monitoringConfig.thresholds.errorRate.critical,
          warningThreshold: monitoringConfig.thresholds.errorRate.warning,
          timestamp: new Date().toISOString()
        });

        if (errorRate >= monitoringConfig.thresholds.errorRate.critical) {
          await alertSystem.sendAlert({
            type: 'error_rate',
            severity: 'critical',
            title: 'Critical Error Rate Alert',
            description: `Application error rate is ${errorRate.toFixed(2)}%, exceeding critical threshold of ${monitoringConfig.thresholds.errorRate.critical}%`,
            metrics: {
              errorRate,
              threshold: monitoringConfig.thresholds.errorRate.critical,
              totalRequests: errorRateMetric.metadata?.totalRequests || 0,
              errorRequests: errorRateMetric.metadata?.errorRequests || 0
            }
          });
        } else if (errorRate >= monitoringConfig.thresholds.errorRate.warning) {
          await alertSystem.sendAlert({
            type: 'error_rate',
            severity: 'warning',
            title: 'High Error Rate Warning',
            description: `Application error rate is ${errorRate.toFixed(2)}%, exceeding warning threshold of ${monitoringConfig.thresholds.errorRate.warning}%`,
            metrics: {
              errorRate,
              threshold: monitoringConfig.thresholds.errorRate.warning,
              totalRequests: errorRateMetric.metadata?.totalRequests || 0,
              errorRequests: errorRateMetric.metadata?.errorRequests || 0
            }
          });
        }
      } else {
        logger.debug('No error rate metric found or no values available', {
          schedulerEvent: 'ERROR_RATE_METRIC_MISSING',
          metricsAvailable: metrics.map(m => m.name),
          timestamp: new Date().toISOString()
        });
      }

      logger.debug('Alert checks completed', {
        schedulerEvent: 'ALERT_CHECKS_COMPLETED',
        metricsChecked: metrics.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Alert checks error', {
        schedulerEvent: 'ALERT_CHECKS_ERROR',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Perform cleanup tasks
   */
  async performCleanupTasks() {
    try {
      // Clean up old log files (if needed)
      // Clean up old metrics data
      // Clean up alert history
      
      // Reset metrics if needed
      const now = Date.now();
      const lastReset = this.lastMetricsReset || 0;
      const resetInterval = 24 * 60 * 60 * 1000; // 24 hours

      if (now - lastReset > resetInterval) {
        // Don't actually reset metrics in production, just log
        logger.info('Daily metrics maintenance', {
          schedulerEvent: 'METRICS_MAINTENANCE',
          lastReset: new Date(lastReset).toISOString(),
          timestamp: new Date().toISOString()
        });
        
        this.lastMetricsReset = now;
      }

      logger.info('Cleanup tasks completed', {
        schedulerEvent: 'CLEANUP_COMPLETED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Cleanup tasks error', {
        schedulerEvent: 'CLEANUP_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Determine overall health from individual checks
   */
  determineOverallHealth(checks) {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('unhealthy')) return 'unhealthy';
    if (statuses.includes('warning') || statuses.includes('degraded')) return 'degraded';
    return 'healthy';
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      tasksCount: this.tasks.size,
      tasks: Array.from(this.tasks.keys()),
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }
}

// Create singleton instance
const monitoringScheduler = new MonitoringScheduler();

module.exports = monitoringScheduler;
