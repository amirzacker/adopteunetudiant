const client = require('prom-client');
const logger = require('./logger');

/**
 * Prometheus Metrics Collection System
 * Provides comprehensive application metrics for monitoring and alerting
 */
class MetricsCollector {
  constructor() {
    // Create a Registry to register the metrics
    this.register = new client.Registry();
    
    // Add default metrics (CPU, memory, etc.)
    client.collectDefaultMetrics({
      register: this.register,
      prefix: 'adopte_etudiant_',
    });

    this.initializeCustomMetrics();
  }

  /**
   * Initialize custom application metrics
   */
  initializeCustomMetrics() {
    // HTTP Request metrics
    this.httpRequestDuration = new client.Histogram({
      name: 'adopte_etudiant_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    this.httpRequestsTotal = new client.Counter({
      name: 'adopte_etudiant_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    // Database metrics
    this.databaseOperationDuration = new client.Histogram({
      name: 'adopte_etudiant_database_operation_duration_seconds',
      help: 'Duration of database operations in seconds',
      labelNames: ['operation', 'collection', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
    });

    this.databaseConnectionsActive = new client.Gauge({
      name: 'adopte_etudiant_database_connections_active',
      help: 'Number of active database connections'
    });

    // Business metrics
    this.usersTotal = new client.Gauge({
      name: 'adopte_etudiant_users_total',
      help: 'Total number of registered users',
      labelNames: ['type'] // student, company
    });

    this.jobOffersTotal = new client.Gauge({
      name: 'adopte_etudiant_job_offers_total',
      help: 'Total number of job offers',
      labelNames: ['status'] // active, expired, draft
    });

    this.applicationsTotal = new client.Gauge({
      name: 'adopte_etudiant_applications_total',
      help: 'Total number of job applications',
      labelNames: ['status'] // pending, accepted, rejected
    });

    this.adoptionsTotal = new client.Gauge({
      name: 'adopte_etudiant_adoptions_total',
      help: 'Total number of adoptions',
      labelNames: ['status'] // active, completed, cancelled
    });

    // System health metrics
    this.healthCheckStatus = new client.Gauge({
      name: 'adopte_etudiant_health_check_status',
      help: 'Health check status (1 = healthy, 0 = unhealthy)',
      labelNames: ['check_type'] // database, memory, system, services
    });

    this.errorRate = new client.Gauge({
      name: 'adopte_etudiant_error_rate',
      help: 'Application error rate percentage'
    });

    // Socket.IO metrics
    this.socketConnections = new client.Gauge({
      name: 'adopte_etudiant_socket_connections_active',
      help: 'Number of active Socket.IO connections'
    });

    this.socketMessages = new client.Counter({
      name: 'adopte_etudiant_socket_messages_total',
      help: 'Total number of Socket.IO messages',
      labelNames: ['event_type']
    });

    // Register all custom metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestsTotal);
    this.register.registerMetric(this.databaseOperationDuration);
    this.register.registerMetric(this.databaseConnectionsActive);
    this.register.registerMetric(this.usersTotal);
    this.register.registerMetric(this.jobOffersTotal);
    this.register.registerMetric(this.applicationsTotal);
    this.register.registerMetric(this.adoptionsTotal);
    this.register.registerMetric(this.healthCheckStatus);
    this.register.registerMetric(this.errorRate);
    this.register.registerMetric(this.socketConnections);
    this.register.registerMetric(this.socketMessages);

    logger.info('Prometheus metrics initialized', {
      metricsEvent: 'METRICS_INITIALIZED',
      customMetrics: 10,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(method, route, statusCode, duration) {
    const labels = { method, route, status_code: statusCode };
    
    this.httpRequestDuration.observe(labels, duration / 1000); // Convert to seconds
    this.httpRequestsTotal.inc(labels);
  }

  /**
   * Record database operation metrics
   */
  recordDatabaseOperation(operation, collection, status, duration) {
    const labels = { operation, collection, status };
    this.databaseOperationDuration.observe(labels, duration / 1000);
  }

  /**
   * Update business metrics
   */
  async updateBusinessMetrics() {
    try {
      const User = require('../api/users/users.model');
      const JobOffer = require('../api/jobOffers/jobOffers.model');
      const JobApplication = require('../api/jobApplications/jobApplications.model');
      const Adoption = require('../api/adoptions/adoptions.model');

      // Update user counts
      const studentCount = await User.countDocuments({ isStudent: true });
      const companyCount = await User.countDocuments({ isCompany: true });
      
      this.usersTotal.set({ type: 'student' }, studentCount);
      this.usersTotal.set({ type: 'company' }, companyCount);

      // Update job offer counts
      const activeJobOffers = await JobOffer.countDocuments({ status: 'active' });
      const expiredJobOffers = await JobOffer.countDocuments({ status: 'expired' });
      
      this.jobOffersTotal.set({ status: 'active' }, activeJobOffers);
      this.jobOffersTotal.set({ status: 'expired' }, expiredJobOffers);

      // Update application counts
      const pendingApplications = await JobApplication.countDocuments({ status: 'pending' });
      const acceptedApplications = await JobApplication.countDocuments({ status: 'accepted' });
      const rejectedApplications = await JobApplication.countDocuments({ status: 'rejected' });
      
      this.applicationsTotal.set({ status: 'pending' }, pendingApplications);
      this.applicationsTotal.set({ status: 'accepted' }, acceptedApplications);
      this.applicationsTotal.set({ status: 'rejected' }, rejectedApplications);

      // Update adoption counts
      const activeAdoptions = await Adoption.countDocuments({ status: 'active' });
      const completedAdoptions = await Adoption.countDocuments({ status: 'completed' });
      
      this.adoptionsTotal.set({ status: 'active' }, activeAdoptions);
      this.adoptionsTotal.set({ status: 'completed' }, completedAdoptions);

    } catch (error) {
      logger.error('Failed to update business metrics', {
        metricsEvent: 'BUSINESS_METRICS_UPDATE_FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update health check metrics
   */
  updateHealthMetrics(healthData) {
    try {
      if (healthData.checks) {
        Object.entries(healthData.checks).forEach(([checkType, checkResult]) => {
          const status = checkResult.status === 'healthy' ? 1 : 0;
          this.healthCheckStatus.set({ check_type: checkType }, status);
        });
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
   * Update Socket.IO metrics
   */
  updateSocketMetrics(activeConnections) {
    this.socketConnections.set(activeConnections);
  }

  /**
   * Record Socket.IO message
   */
  recordSocketMessage(eventType) {
    this.socketMessages.inc({ event_type: eventType });
  }

  /**
   * Update error rate metric
   */
  updateErrorRate(errorRate) {
    this.errorRate.set(errorRate);
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics() {
    try {
      // Update business metrics before returning
      await this.updateBusinessMetrics();
      
      return await this.register.metrics();
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
   * Get metrics as JSON for internal use
   */
  async getMetricsJson() {
    try {
      const metrics = await this.register.getMetricsAsJSON();
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
   * Reset all metrics (useful for testing)
   */
  reset() {
    this.register.resetMetrics();
    logger.info('Metrics reset', {
      metricsEvent: 'METRICS_RESET',
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;
