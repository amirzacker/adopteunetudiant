/**
 * Test Configuration
 * Centralized configuration for all tests
 */

const authHelper = require("../__mocks__/utils/auth.helper");

/**
 * Test Configuration Object
 */
const testConfig = {
  // API Base URLs
  api: {
    baseUrl: '/api',
    endpoints: {
      users: '/api/users',
      adoptions: '/api/adoptions',
      contracts: '/api/contracts',
      messages: '/api/messages',
      conversations: '/api/conversations',
      jobOffers: '/api/jobOffers',
      jobApplications: '/api/jobApplications',
      domains: '/api/domains',
      searchTypes: '/api/searchTypes'
    }
  },

  // Test timeouts
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000
  },

  // Default test IDs
  defaultIds: authHelper.getDefaultIds(),

  // Test data limits
  limits: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxFileSize: 1024 * 1024, // 1MB
    maxConcurrentRequests: 10
  },

  // HTTP status codes for testing
  statusCodes: {
    success: {
      ok: 200,
      created: 201,
      accepted: 202,
      noContent: 204
    },
    clientError: {
      badRequest: 400,
      unauthorized: 401,
      forbidden: 403,
      notFound: 404,
      methodNotAllowed: 405,
      conflict: 409,
      unprocessableEntity: 422,
      tooManyRequests: 429
    },
    serverError: {
      internalServerError: 500,
      notImplemented: 501,
      badGateway: 502,
      serviceUnavailable: 503
    }
  },

  // Common test scenarios
  scenarios: {
    authentication: {
      validStudent: 'validStudent',
      validCompany: 'validCompany',
      validAdmin: 'validAdmin',
      invalidToken: 'invalidToken',
      expiredToken: 'expiredToken',
      missingToken: 'missingToken'
    },
    validation: {
      missingRequired: 'missingRequired',
      invalidFormat: 'invalidFormat',
      tooLong: 'tooLong',
      tooShort: 'tooShort',
      invalidType: 'invalidType'
    },
    database: {
      notFound: 'notFound',
      duplicateKey: 'duplicateKey',
      validationError: 'validationError',
      connectionError: 'connectionError'
    }
  },

  // Test data patterns
  patterns: {
    objectId: /^[0-9a-fA-F]{24}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    phone: /^\+33[0-9]{9}$/,
    siret: /^[0-9]{14}$/
  },

  // Security test payloads
  security: {
    xss: [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert('xss')",
      "<svg onload=alert('xss')>"
    ],
    sqlInjection: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --"
    ],
    pathTraversal: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "....//....//....//etc/passwd"
    ],
    malformedJson: [
      "{ invalid json }",
      "{ \"unclosed\": \"string }",
      "{ trailing: comma, }",
      "invalid json string"
    ]
  },

  // Performance test parameters
  performance: {
    concurrentRequests: 5,
    sequentialRequests: 10,
    largeDataSize: 10000,
    timeoutThreshold: 5000
  },

  // Mock data configuration
  mocks: {
    userCount: {
      small: 3,
      medium: 10,
      large: 50
    },
    pagination: {
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100
    }
  },

  // Test environment settings
  environment: {
    nodeEnv: process.env.NODE_ENV || 'test',
    verbose: process.env.VERBOSE_TESTS === 'true',
    coverage: process.env.COVERAGE === 'true',
    ci: process.env.CI === 'true'
  }
};

/**
 * Get endpoint URL
 * @param {string} endpoint - Endpoint name
 * @param {string} id - Optional ID parameter
 * @returns {string} Full endpoint URL
 */
testConfig.getEndpoint = function(endpoint, id = null) {
  const baseUrl = this.api.endpoints[endpoint];
  if (!baseUrl) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  return id ? `${baseUrl}/${id}` : baseUrl;
};

/**
 * Get status codes for a category
 * @param {string} category - Status code category (success, clientError, serverError)
 * @returns {Array} Array of status codes
 */
testConfig.getStatusCodes = function(category) {
  const codes = this.statusCodes[category];
  if (!codes) {
    throw new Error(`Unknown status code category: ${category}`);
  }
  return Object.values(codes);
};

/**
 * Check if status code is in expected range
 * @param {number} statusCode - HTTP status code
 * @param {string} category - Expected category
 * @returns {boolean} True if status code is in expected category
 */
testConfig.isStatusCodeInCategory = function(statusCode, category) {
  const codes = this.getStatusCodes(category);
  return codes.includes(statusCode);
};

/**
 * Get security payload by type
 * @param {string} type - Payload type (xss, sqlInjection, etc.)
 * @returns {Array} Array of security payloads
 */
testConfig.getSecurityPayloads = function(type) {
  const payloads = this.security[type];
  if (!payloads) {
    throw new Error(`Unknown security payload type: ${type}`);
  }
  return payloads;
};

/**
 * Validate pattern match
 * @param {string} value - Value to validate
 * @param {string} patternName - Pattern name
 * @returns {boolean} True if value matches pattern
 */
testConfig.matchesPattern = function(value, patternName) {
  const pattern = this.patterns[patternName];
  if (!pattern) {
    throw new Error(`Unknown pattern: ${patternName}`);
  }
  return pattern.test(value);
};

/**
 * Get timeout for test type
 * @param {string} type - Timeout type (short, medium, long)
 * @returns {number} Timeout in milliseconds
 */
testConfig.getTimeout = function(type = 'medium') {
  const timeout = this.timeouts[type];
  if (!timeout) {
    throw new Error(`Unknown timeout type: ${type}`);
  }
  return timeout;
};

/**
 * Check if running in CI environment
 * @returns {boolean} True if running in CI
 */
testConfig.isCI = function() {
  return this.environment.ci;
};

/**
 * Check if verbose mode is enabled
 * @returns {boolean} True if verbose mode is enabled
 */
testConfig.isVerbose = function() {
  return this.environment.verbose;
};

/**
 * Get mock data count for size
 * @param {string} size - Size category (small, medium, large)
 * @returns {number} Number of mock items to generate
 */
testConfig.getMockCount = function(size = 'small') {
  const count = this.mocks.userCount[size];
  if (!count) {
    throw new Error(`Unknown mock size: ${size}`);
  }
  return count;
};

module.exports = testConfig;
