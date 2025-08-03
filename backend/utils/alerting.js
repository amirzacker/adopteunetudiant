const { IncomingWebhook } = require('@slack/webhook');
const logger = require('./logger');
const LogMetadata = require('./logMetadata');

/**
 * Alert System for Monitoring and Supervision
 * Handles notifications via Slack for system alerts
 */
class AlertSystem {
  constructor() {
    this.slackWebhook = null;
    this.alertThresholds = this.getAlertThresholds();
    this.alertHistory = new Map(); // Track alert frequency to prevent spam
    this.initializeNotificationChannels();
  }

  /**
   * Initialize notification channels
   */
  initializeNotificationChannels() {
    // Initialize Slack webhook if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      this.slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

      logger.info('Slack alerting configured', {
        alertEvent: 'SLACK_CONFIGURED',
        timestamp: new Date().toISOString()
      });
    } else {
      logger.warn('Configure SLACK_WEBHOOK_URL environment variable for alerts', {
        alertEvent: 'NO_SLACK_CONFIGURED',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get alert thresholds from environment or defaults
   */
  getAlertThresholds() {
    return {
      responseTime: {
        warning: parseInt(process.env.ALERT_RESPONSE_TIME_WARNING) || 1000, // 1 second
        critical: parseInt(process.env.ALERT_RESPONSE_TIME_CRITICAL) || 5000 // 5 seconds
      },
      errorRate: {
        warning: parseFloat(process.env.ALERT_ERROR_RATE_WARNING) || 5.0, // 5%
        critical: parseFloat(process.env.ALERT_ERROR_RATE_CRITICAL) || 10.0 // 10%
      },
      memoryUsage: {
        warning: parseFloat(process.env.ALERT_MEMORY_WARNING) || 80.0, // 80%
        critical: parseFloat(process.env.ALERT_MEMORY_CRITICAL) || 90.0 // 90%
      },
      cpuLoad: {
        warning: parseFloat(process.env.ALERT_CPU_WARNING) || 75.0, // 75%
        critical: parseFloat(process.env.ALERT_CPU_CRITICAL) || 90.0 // 90%
      },
      databaseResponseTime: {
        warning: parseInt(process.env.ALERT_DB_RESPONSE_WARNING) || 500, // 500ms
        critical: parseInt(process.env.ALERT_DB_RESPONSE_CRITICAL) || 2000 // 2 seconds
      }
    };
  }

  /**
   * Send alert notification
   */
  async sendAlert(alertData) {
    const alertKey = `${alertData.type}_${alertData.severity}`;
    const now = Date.now();
    
    // Check if we've sent this alert recently (throttling)
    const lastAlert = this.alertHistory.get(alertKey);
    const throttleTime = this.getThrottleTime(alertData.severity);
    
    if (lastAlert && (now - lastAlert) < throttleTime) {
      logger.debug('Alert throttled', {
        alertEvent: 'ALERT_THROTTLED',
        alertType: alertData.type,
        severity: alertData.severity,
        lastAlert: new Date(lastAlert).toISOString(),
        throttleTime: `${throttleTime}ms`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Update alert history
    this.alertHistory.set(alertKey, now);

    try {
      // Send to Slack if configured
      if (this.slackWebhook) {
        await this.sendSlackAlert(alertData);
      }

      logger.info('Alert sent', {
        alertEvent: 'ALERT_SENT',
        alertType: alertData.type,
        severity: alertData.severity,
        channels: {
          slack: !!this.slackWebhook
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to send alert', {
        alertEvent: 'ALERT_SEND_FAILED',
        alertType: alertData.type,
        severity: alertData.severity,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }



  /**
   * Send Slack alert
   */
  async sendSlackAlert(alertData) {
    if (!this.slackWebhook) return;

    const color = this.getSeverityColor(alertData.severity);
    const slackMessage = {
      text: `🚨 ${alertData.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Severity',
              value: alertData.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Type',
              value: alertData.type,
              short: true
            },
            {
              title: 'Description',
              value: alertData.description,
              short: false
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true
            }
          ]
        }
      ]
    };

    if (alertData.metrics) {
      slackMessage.attachments[0].fields.push({
        title: 'Metrics',
        value: JSON.stringify(alertData.metrics, null, 2),
        short: false
      });
    }

    try {
      await this.slackWebhook.send(slackMessage);
      
      logger.info('Slack alert sent', {
        alertEvent: 'SLACK_ALERT_SENT',
        alertType: alertData.type,
        severity: alertData.severity,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to send Slack alert', {
        alertEvent: 'SLACK_ALERT_FAILED',
        alertType: alertData.type,
        severity: alertData.severity,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }



  /**
   * Get color for severity level
   */
  getSeverityColor(severity) {
    const colors = {
      info: '#36a64f',
      warning: '#ff9500',
      critical: '#ff0000'
    };
    return colors[severity] || '#cccccc';
  }

  /**
   * Get throttle time based on severity
   */
  getThrottleTime(severity) {
    const throttleTimes = {
      info: 30 * 60 * 1000,    // 30 minutes
      warning: 15 * 60 * 1000, // 15 minutes
      critical: 5 * 60 * 1000  // 5 minutes
    };
    return throttleTimes[severity] || 30 * 60 * 1000;
  }

  /**
   * Check metrics against thresholds and send alerts
   */
  async checkAndAlert(healthData, metrics) {
    try {
      // Check response time
      if (healthData.responseTime) {
        const responseTimeMs = parseInt(healthData.responseTime.replace('ms', ''));
        await this.checkResponseTime(responseTimeMs);
      }

      // Check memory usage
      if (healthData.checks && healthData.checks.memory) {
        await this.checkMemoryUsage(healthData.checks.memory);
      }

      // Check system load
      if (healthData.checks && healthData.checks.system) {
        await this.checkSystemLoad(healthData.checks.system);
      }

      // Check database health
      if (healthData.checks && healthData.checks.database) {
        await this.checkDatabaseHealth(healthData.checks.database);
      }

    } catch (error) {
      logger.error('Failed to check alerts', {
        alertEvent: 'ALERT_CHECK_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check response time thresholds
   */
  async checkResponseTime(responseTimeMs) {
    if (responseTimeMs >= this.alertThresholds.responseTime.critical) {
      await this.sendAlert({
        type: 'response_time',
        severity: 'critical',
        title: 'Critical Response Time Alert',
        description: `Health check response time is ${responseTimeMs}ms, exceeding critical threshold of ${this.alertThresholds.responseTime.critical}ms`,
        metrics: { responseTime: responseTimeMs, threshold: this.alertThresholds.responseTime.critical }
      });
    } else if (responseTimeMs >= this.alertThresholds.responseTime.warning) {
      await this.sendAlert({
        type: 'response_time',
        severity: 'warning',
        title: 'High Response Time Warning',
        description: `Health check response time is ${responseTimeMs}ms, exceeding warning threshold of ${this.alertThresholds.responseTime.warning}ms`,
        metrics: { responseTime: responseTimeMs, threshold: this.alertThresholds.responseTime.warning }
      });
    }
  }

  /**
   * Check memory usage thresholds
   */
  async checkMemoryUsage(memoryData) {
    if (memoryData.usage && memoryData.usage.heapPercent >= this.alertThresholds.memoryUsage.critical) {
      await this.sendAlert({
        type: 'memory_usage',
        severity: 'critical',
        title: 'Critical Memory Usage Alert',
        description: `Heap memory usage is ${memoryData.usage.heapPercent}%, exceeding critical threshold of ${this.alertThresholds.memoryUsage.critical}%`,
        metrics: memoryData.usage
      });
    } else if (memoryData.usage && memoryData.usage.heapPercent >= this.alertThresholds.memoryUsage.warning) {
      await this.sendAlert({
        type: 'memory_usage',
        severity: 'warning',
        title: 'High Memory Usage Warning',
        description: `Heap memory usage is ${memoryData.usage.heapPercent}%, exceeding warning threshold of ${this.alertThresholds.memoryUsage.warning}%`,
        metrics: memoryData.usage
      });
    }
  }

  /**
   * Check system load thresholds
   */
  async checkSystemLoad(systemData) {
    if (systemData.metrics && systemData.metrics.loadPercent >= this.alertThresholds.cpuLoad.critical) {
      await this.sendAlert({
        type: 'system_load',
        severity: 'critical',
        title: 'Critical System Load Alert',
        description: `System load is ${systemData.metrics.loadPercent}%, exceeding critical threshold of ${this.alertThresholds.cpuLoad.critical}%`,
        metrics: { loadPercent: systemData.metrics.loadPercent, loadAverage: systemData.metrics.loadAverage }
      });
    } else if (systemData.metrics && systemData.metrics.loadPercent >= this.alertThresholds.cpuLoad.warning) {
      await this.sendAlert({
        type: 'system_load',
        severity: 'warning',
        title: 'High System Load Warning',
        description: `System load is ${systemData.metrics.loadPercent}%, exceeding warning threshold of ${this.alertThresholds.cpuLoad.warning}%`,
        metrics: { loadPercent: systemData.metrics.loadPercent, loadAverage: systemData.metrics.loadAverage }
      });
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth(databaseData) {
    if (databaseData.status === 'critical') {
      await this.sendAlert({
        type: 'database',
        severity: 'critical',
        title: 'Critical Database Alert',
        description: `Database is in critical state: ${databaseData.message}`,
        metrics: databaseData
      });
    } else if (databaseData.status === 'unhealthy') {
      await this.sendAlert({
        type: 'database',
        severity: 'warning',
        title: 'Database Health Warning',
        description: `Database health issue detected: ${databaseData.message}`,
        metrics: databaseData
      });
    }

    // Check database response time
    if (databaseData.responseTime) {
      const responseTimeMs = parseInt(databaseData.responseTime.replace('ms', ''));
      if (responseTimeMs >= this.alertThresholds.databaseResponseTime.critical) {
        await this.sendAlert({
          type: 'database_performance',
          severity: 'critical',
          title: 'Critical Database Performance Alert',
          description: `Database response time is ${responseTimeMs}ms, exceeding critical threshold of ${this.alertThresholds.databaseResponseTime.critical}ms`,
          metrics: { responseTime: responseTimeMs, threshold: this.alertThresholds.databaseResponseTime.critical }
        });
      } else if (responseTimeMs >= this.alertThresholds.databaseResponseTime.warning) {
        await this.sendAlert({
          type: 'database_performance',
          severity: 'warning',
          title: 'Database Performance Warning',
          description: `Database response time is ${responseTimeMs}ms, exceeding warning threshold of ${this.alertThresholds.databaseResponseTime.warning}ms`,
          metrics: { responseTime: responseTimeMs, threshold: this.alertThresholds.databaseResponseTime.warning }
        });
      }
    }
  }

  /**
   * Send application startup alert
   */
  async sendStartupAlert() {
    await this.sendAlert({
      type: 'application',
      severity: 'info',
      title: 'Application Started',
      description: `Adopte un Étudiant application has started successfully in ${process.env.NODE_ENV || 'development'} environment`,
      metrics: {
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        uptime: process.uptime()
      }
    });
  }

  /**
   * Send application shutdown alert
   */
  async sendShutdownAlert() {
    await this.sendAlert({
      type: 'application',
      severity: 'warning',
      title: 'Application Shutdown',
      description: 'Adopte un Étudiant application is shutting down',
      metrics: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Test alert system
   */
  async testAlerts() {
    await this.sendAlert({
      type: 'test',
      severity: 'info',
      title: 'Alert System Test',
      description: 'This is a test alert to verify the monitoring and alerting system is working correctly',
      metrics: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Create singleton instance
const alertSystem = new AlertSystem();

module.exports = alertSystem;
