const express = require('express');
const monitoringController = require('./monitoring.controller');
const metricsCollector = require('../../utils/metrics');
const logger = require('../../utils/logger');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, degraded, unhealthy]
 *           description: Overall system health status
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the health check
 *         uptime:
 *           type: number
 *           description: Application uptime in seconds
 *         environment:
 *           type: string
 *           description: Current environment (development, production, test)
 *         version:
 *           type: string
 *           description: Application version
 *         responseTime:
 *           type: string
 *           description: Health check response time
 *         checks:
 *           type: object
 *           properties:
 *             database:
 *               $ref: '#/components/schemas/HealthCheckResult'
 *             memory:
 *               $ref: '#/components/schemas/HealthCheckResult'
 *             system:
 *               $ref: '#/components/schemas/HealthCheckResult'
 *             services:
 *               $ref: '#/components/schemas/HealthCheckResult'
 *     HealthCheckResult:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, warning, degraded, unhealthy, critical]
 *         message:
 *           type: string
 *           description: Human-readable status message
 *         responseTime:
 *           type: string
 *           description: Check response time
 *         metrics:
 *           type: object
 *           description: Additional metrics data
 *     ReadinessProbe:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [ready, not_ready]
 *         timestamp:
 *           type: string
 *           format: date-time
 *     LivenessProbe:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [alive, dead]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptime:
 *           type: number
 *           description: Application uptime in seconds
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Comprehensive health check
 *     tags: [Monitoring]
 *     description: |
 *       Performs a comprehensive health check of the application including:
 *       - Database connectivity and responsiveness
 *       - Memory usage and system resources
 *       - Application services status
 *       - Overall system health assessment
 *       
 *       This endpoint is used for monitoring and alerting systems to determine
 *       application health and trigger alerts when issues are detected.
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: System is unhealthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
router.get('/health', monitoringController.healthCheck);

/**
 * @swagger
 * /api/ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [Monitoring]
 *     description: |
 *       Kubernetes-style readiness probe that indicates whether the application
 *       is ready to receive traffic. Checks essential services like database
 *       connectivity that are required for the application to function properly.
 *     responses:
 *       200:
 *         description: Application is ready to receive traffic
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessProbe'
 *       503:
 *         description: Application is not ready to receive traffic
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessProbe'
 */
router.get('/ready', monitoringController.readinessProbe);

/**
 * @swagger
 * /api/live:
 *   get:
 *     summary: Liveness probe
 *     tags: [Monitoring]
 *     description: |
 *       Kubernetes-style liveness probe that indicates whether the application
 *       is alive and responsive. This is a lightweight check that should always
 *       respond quickly if the application process is running.
 *     responses:
 *       200:
 *         description: Application is alive and responsive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivenessProbe'
 *       503:
 *         description: Application is not responsive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivenessProbe'
 */
router.get('/live', monitoringController.livenessProbe);

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     tags: [Monitoring]
 *     description: |
 *       Exposes application metrics in Prometheus format for scraping by
 *       monitoring systems. Includes:
 *       - HTTP request metrics (duration, count, error rates)
 *       - Database operation metrics
 *       - Business metrics (users, job offers, applications)
 *       - System metrics (CPU, memory, load)
 *       - Socket.IO metrics
 *       
 *       This endpoint should be scraped by Prometheus or compatible monitoring
 *       systems for comprehensive application monitoring.
 *     responses:
 *       200:
 *         description: Metrics data in Prometheus format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Prometheus metrics format
 *       500:
 *         description: Failed to collect metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/metrics', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get metrics in Prometheus format
    const metrics = await metricsCollector.getMetrics();
    
    const responseTime = Date.now() - startTime;
    
    logger.debug('Metrics endpoint accessed', {
      metricsEvent: 'METRICS_ENDPOINT_ACCESSED',
      responseTime: `${responseTime}ms`,
      metricsSize: metrics.length,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(metrics);
    
  } catch (error) {
    logger.error('Failed to serve metrics', {
      metricsEvent: 'METRICS_ENDPOINT_FAILED',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/metrics/json:
 *   get:
 *     summary: Metrics in JSON format
 *     tags: [Monitoring]
 *     description: |
 *       Returns application metrics in JSON format for easier consumption
 *       by custom monitoring tools or dashboards that prefer JSON over
 *       the Prometheus text format.
 *     responses:
 *       200:
 *         description: Metrics data in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Metric name
 *                   help:
 *                     type: string
 *                     description: Metric description
 *                   type:
 *                     type: string
 *                     description: Metric type (counter, gauge, histogram)
 *                   values:
 *                     type: array
 *                     description: Metric values with labels
 *       500:
 *         description: Failed to collect metrics
 */
router.get('/metrics/json', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get metrics in JSON format
    const metrics = await metricsCollector.getMetricsJson();
    
    const responseTime = Date.now() - startTime;
    
    logger.debug('JSON metrics endpoint accessed', {
      metricsEvent: 'JSON_METRICS_ENDPOINT_ACCESSED',
      responseTime: `${responseTime}ms`,
      metricsCount: metrics.length,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      metrics
    });
    
  } catch (error) {
    logger.error('Failed to serve JSON metrics', {
      metricsEvent: 'JSON_METRICS_ENDPOINT_FAILED',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/monitoring/external:
 *   get:
 *     summary: External services health check
 *     tags: [Monitoring]
 *     description: |
 *       Checks the health and connectivity of external services that the
 *       application depends on, such as Elasticsearch for logging and
 *       email services for notifications.
 *     responses:
 *       200:
 *         description: All external services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 responseTime:
 *                   type: string
 *                 services:
 *                   type: object
 *       503:
 *         description: One or more external services are unhealthy
 */
router.get('/monitoring/external', monitoringController.externalServicesCheck);

/**
 * @swagger
 * /api/monitoring/dashboard:
 *   get:
 *     summary: Monitoring dashboard data
 *     tags: [Monitoring]
 *     description: |
 *       Returns comprehensive monitoring data for dashboard display,
 *       including current health status, key metrics, and alert information.
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 health:
 *                   $ref: '#/components/schemas/HealthCheck'
 *                 metrics:
 *                   type: object
 *                 alerts:
 *                   type: array
 *                 uptime:
 *                   type: object
 */
router.get('/monitoring/dashboard', async (req, res) => {
  try {
    const startTime = Date.now();

    // Get comprehensive monitoring data
    const dashboardData = {
      timestamp: new Date().toISOString(),
      health: {},
      metrics: {},
      system: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version
      },
      alerts: {
        active: 0,
        recent: []
      }
    };

    // Get health data (simulate the health check without full response)
    const MonitoringController = require('./monitoring.controller');

    dashboardData.health.database = await MonitoringController.checkDatabase();
    dashboardData.health.memory = MonitoringController.checkMemory();
    dashboardData.health.system = MonitoringController.checkSystem();
    dashboardData.health.services = await MonitoringController.checkServices();

    // Get metrics summary
    const metricsJson = await metricsCollector.getMetricsJson();
    dashboardData.metrics.totalMetrics = metricsJson.length;
    dashboardData.metrics.lastUpdate = new Date().toISOString();

    const responseTime = Date.now() - startTime;
    dashboardData.responseTime = `${responseTime}ms`;

    logger.debug('Dashboard data served', {
      monitoringEvent: 'DASHBOARD_DATA_SERVED',
      responseTime: dashboardData.responseTime,
      healthChecks: Object.keys(dashboardData.health).length,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(dashboardData);

  } catch (error) {
    logger.error('Failed to serve dashboard data', {
      monitoringEvent: 'DASHBOARD_DATA_FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      error: 'Failed to collect dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/monitoring/test:
 *   post:
 *     summary: Test monitoring and alerting system
 *     tags: [Monitoring]
 *     description: |
 *       Sends test alerts to verify the monitoring and alerting system
 *       is properly configured and working. This endpoint should only
 *       be used for testing purposes.
 *     responses:
 *       200:
 *         description: Test alerts sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Failed to send test alerts
 */
router.post('/monitoring/test', async (req, res) => {
  try {
    const alertSystem = require('../../utils/alerting');

    // Send test alert
    await alertSystem.testAlerts();

    logger.info('Test alerts sent', {
      monitoringEvent: 'TEST_ALERTS_SENT',
      timestamp: new Date().toISOString(),
      requestedBy: req.ip
    });

    res.status(200).json({
      message: 'Test alerts sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to send test alerts', {
      monitoringEvent: 'TEST_ALERTS_FAILED',
      error: error.message,
      timestamp: new Date().toISOString(),
      requestedBy: req.ip
    });

    res.status(500).json({
      error: 'Failed to send test alerts',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
