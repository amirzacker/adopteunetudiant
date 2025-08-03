/**
 * Monitoring and Alerting Configuration
 * Centralized configuration for the supervision system
 */

const monitoringConfig = {
  // Health check intervals (in milliseconds)
  intervals: {
    healthCheck: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
    metricsUpdate: parseInt(process.env.METRICS_UPDATE_INTERVAL) || 60000, // 1 minute
    businessMetrics: parseInt(process.env.BUSINESS_METRICS_INTERVAL) || 300000, // 5 minutes
    externalServices: parseInt(process.env.EXTERNAL_SERVICES_INTERVAL) || 120000 // 2 minutes
  },

  // Alert thresholds
  thresholds: {
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
    },
    diskUsage: {
      warning: parseFloat(process.env.ALERT_DISK_WARNING) || 80.0, // 80%
      critical: parseFloat(process.env.ALERT_DISK_CRITICAL) || 90.0 // 90%
    }
  },

  // Alert throttling (in milliseconds)
  throttling: {
    info: parseInt(process.env.ALERT_THROTTLE_INFO) || 30 * 60 * 1000,    // 30 minutes
    warning: parseInt(process.env.ALERT_THROTTLE_WARNING) || 15 * 60 * 1000, // 15 minutes
    critical: parseInt(process.env.ALERT_THROTTLE_CRITICAL) || 5 * 60 * 1000  // 5 minutes
  },

  // Notification channels configuration
  notifications: {
    email: {
      enabled: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS),
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ALERT_EMAIL_TO || process.env.EMAIL_USER,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    slack: {
      enabled: !!process.env.SLACK_WEBHOOK_URL,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#alerts',
      username: process.env.SLACK_USERNAME || 'Adopte un Étudiant Monitor'
    }
  },

  // Monitoring scope definition
  scope: {
    // Application components to monitor
    components: [
      'web_server',
      'database',
      'socket_io',
      'file_uploads',
      'authentication',
      'api_endpoints'
    ],
    
    // Business processes to monitor
    businessProcesses: [
      'user_registration',
      'job_posting',
      'job_application',
      'adoption_process',
      'messaging_system'
    ],
    
    // System resources to monitor
    systemResources: [
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'network_io',
      'process_health'
    ]
  },

  // Monitoring indicators and their purposes
  indicators: {
    // Performance indicators
    performance: {
      'http_request_duration': {
        purpose: 'Track API response times to detect performance degradation',
        threshold: 'warning: >1s, critical: >5s',
        alerting: true
      },
      'database_operation_duration': {
        purpose: 'Monitor database query performance',
        threshold: 'warning: >500ms, critical: >2s',
        alerting: true
      },
      'memory_usage_percent': {
        purpose: 'Track memory consumption to prevent out-of-memory errors',
        threshold: 'warning: >80%, critical: >90%',
        alerting: true
      },
      'cpu_load_percent': {
        purpose: 'Monitor CPU utilization to detect resource bottlenecks',
        threshold: 'warning: >75%, critical: >90%',
        alerting: true
      }
    },
    
    // Quality indicators
    quality: {
      'error_rate_percent': {
        purpose: 'Track application error rate to detect issues',
        threshold: 'warning: >5%, critical: >10%',
        alerting: true
      },
      'http_status_codes': {
        purpose: 'Monitor HTTP response status distribution',
        threshold: 'alert on 5xx errors',
        alerting: true
      },
      'database_connection_status': {
        purpose: 'Ensure database connectivity is maintained',
        threshold: 'alert on disconnection',
        alerting: true
      }
    },
    
    // Business indicators
    business: {
      'active_users_count': {
        purpose: 'Track user engagement and system usage',
        threshold: 'informational only',
        alerting: false
      },
      'job_offers_count': {
        purpose: 'Monitor business activity and growth',
        threshold: 'informational only',
        alerting: false
      },
      'applications_count': {
        purpose: 'Track application success and user engagement',
        threshold: 'informational only',
        alerting: false
      },
      'socket_connections_active': {
        purpose: 'Monitor real-time communication system health',
        threshold: 'informational only',
        alerting: false
      }
    }
  },

  // Monitoring probes configuration
  probes: {
    // Health check probe
    health: {
      endpoint: '/api/health',
      method: 'GET',
      timeout: 10000, // 10 seconds
      interval: 30000, // 30 seconds
      purpose: 'Comprehensive system health assessment',
      checks: ['database', 'memory', 'system', 'services']
    },
    
    // Readiness probe
    readiness: {
      endpoint: '/api/ready',
      method: 'GET',
      timeout: 5000, // 5 seconds
      interval: 15000, // 15 seconds
      purpose: 'Determine if application is ready to receive traffic'
    },
    
    // Liveness probe
    liveness: {
      endpoint: '/api/live',
      method: 'GET',
      timeout: 3000, // 3 seconds
      interval: 10000, // 10 seconds
      purpose: 'Verify application process is alive and responsive'
    },
    
    // Metrics probe
    metrics: {
      endpoint: '/api/metrics',
      method: 'GET',
      timeout: 15000, // 15 seconds
      interval: 60000, // 1 minute
      purpose: 'Collect Prometheus metrics for monitoring systems'
    }
  },

  // Permanent availability guarantee mechanisms
  availability: {
    // High availability features
    features: [
      'automatic_restart', // PM2 autorestart
      'health_monitoring', // Continuous health checks
      'load_balancing',    // Multiple PM2 instances
      'graceful_shutdown', // Proper shutdown handling
      'circuit_breaker',   // Prevent cascade failures
      'rate_limiting'      // Protect against overload
    ],
    
    // Uptime targets
    targets: {
      monthly: 99.9,  // 99.9% uptime target
      daily: 99.95,   // 99.95% daily uptime
      weekly: 99.9    // 99.9% weekly uptime
    },
    
    // Recovery procedures
    recovery: {
      'database_failure': 'Automatic reconnection with exponential backoff',
      'memory_exhaustion': 'Automatic process restart via PM2',
      'high_error_rate': 'Circuit breaker activation and alert escalation',
      'external_service_failure': 'Graceful degradation and retry logic'
    }
  },

  // Alert escalation rules
  escalation: {
    levels: [
      {
        level: 1,
        severity: ['info'],
        channels: ['slack'],
        delay: 0
      },
      {
        level: 2,
        severity: ['warning'],
        channels: ['slack', 'email'],
        delay: 0
      },
      {
        level: 3,
        severity: ['critical'],
        channels: ['slack', 'email'],
        delay: 0,
        repeat: 15 * 60 * 1000 // Repeat every 15 minutes until resolved
      }
    ]
  }
};

module.exports = monitoringConfig;
