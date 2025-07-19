const request = require("supertest");
const authHelper = require("./auth.helper");

/**
 * Request Helper for Tests
 * Provides common HTTP request utilities and patterns
 */
class RequestHelper {
  constructor(app) {
    this.app = app;
  }

  /**
   * Initialize with app instance
   * @param {object} app - Express app instance
   */
  setApp(app) {
    this.app = app;
  }

  /**
   * Make an authenticated GET request
   * @param {string} url - Request URL
   * @param {string} token - JWT token
   * @returns {Promise} Supertest request promise
   */
  authenticatedGet(url, token) {
    return request(this.app)
      .get(url)
      .set(authHelper.createAuthHeaders(token));
  }

  /**
   * Make an authenticated POST request
   * @param {string} url - Request URL
   * @param {object} data - Request body data
   * @param {string} token - JWT token
   * @returns {Promise} Supertest request promise
   */
  authenticatedPost(url, data, token) {
    return request(this.app)
      .post(url)
      .set(authHelper.createAuthHeaders(token))
      .send(data);
  }

  /**
   * Make an authenticated PUT request
   * @param {string} url - Request URL
   * @param {object} data - Request body data
   * @param {string} token - JWT token
   * @returns {Promise} Supertest request promise
   */
  authenticatedPut(url, data, token) {
    return request(this.app)
      .put(url)
      .set(authHelper.createAuthHeaders(token))
      .send(data);
  }

  /**
   * Make an authenticated DELETE request
   * @param {string} url - Request URL
   * @param {string} token - JWT token
   * @returns {Promise} Supertest request promise
   */
  authenticatedDelete(url, token) {
    return request(this.app)
      .delete(url)
      .set(authHelper.createAuthHeaders(token));
  }

  /**
   * Make an unauthenticated GET request
   * @param {string} url - Request URL
   * @returns {Promise} Supertest request promise
   */
  unauthenticatedGet(url) {
    return request(this.app).get(url);
  }

  /**
   * Make an unauthenticated POST request
   * @param {string} url - Request URL
   * @param {object} data - Request body data
   * @returns {Promise} Supertest request promise
   */
  unauthenticatedPost(url, data = {}) {
    return request(this.app)
      .post(url)
      .send(data);
  }

  /**
   * Test multiple routes for authentication requirement
   * @param {Array} routes - Array of route strings
   * @param {number} expectedStatus - Expected HTTP status (default: 401)
   * @returns {Promise} Promise that resolves when all tests complete
   */
  async testRoutesRequireAuth(routes, expectedStatus = 401) {
    const results = [];
    
    for (const route of routes) {
      const res = await this.unauthenticatedGet(route);
      results.push({
        route,
        status: res.status,
        passed: res.status === expectedStatus
      });
    }
    
    return results;
  }

  /**
   * Test multiple routes with invalid token
   * @param {Array} routes - Array of route strings
   * @param {number} expectedStatus - Expected HTTP status (default: 401)
   * @returns {Promise} Promise that resolves when all tests complete
   */
  async testRoutesWithInvalidToken(routes, expectedStatus = 401) {
    const invalidToken = authHelper.generateInvalidToken();
    const results = [];
    
    for (const route of routes) {
      const res = await this.authenticatedGet(route, invalidToken);
      results.push({
        route,
        status: res.status,
        passed: res.status === expectedStatus
      });
    }
    
    return results;
  }

  /**
   * Test multiple HTTP methods on a route
   * @param {string} route - Route to test
   * @param {Array} methods - HTTP methods to test
   * @param {Array} expectedStatuses - Array of acceptable status codes
   * @returns {Promise} Promise that resolves when all tests complete
   */
  async testHttpMethods(route, methods = ['get', 'post', 'put', 'delete'], expectedStatuses = [401, 404, 405]) {
    const results = [];
    
    for (const method of methods) {
      const res = await request(this.app)[method](route);
      results.push({
        method,
        route,
        status: res.status,
        passed: expectedStatuses.includes(res.status)
      });
    }
    
    return results;
  }

  /**
   * Test routes with special characters
   * @param {Array} specialRoutes - Array of routes with special characters
   * @param {Array} expectedStatuses - Array of acceptable status codes
   * @returns {Promise} Promise that resolves when all tests complete
   */
  async testSpecialCharacterRoutes(specialRoutes, expectedStatuses = [400, 404]) {
    const results = [];
    
    for (const route of specialRoutes) {
      const res = await this.unauthenticatedGet(route);
      results.push({
        route,
        status: res.status,
        passed: expectedStatuses.includes(res.status)
      });
    }
    
    return results;
  }

  /**
   * Test concurrent requests to a route
   * @param {string} route - Route to test
   * @param {number} concurrency - Number of concurrent requests
   * @param {number} expectedStatus - Expected HTTP status
   * @returns {Promise} Promise that resolves when all requests complete
   */
  async testConcurrentRequests(route, concurrency = 3, expectedStatus = 404) {
    const promises = Array(concurrency).fill().map(() => 
      this.unauthenticatedGet(route)
    );
    
    const results = await Promise.all(promises);
    
    return results.map((res, index) => ({
      requestIndex: index,
      status: res.status,
      passed: res.status === expectedStatus
    }));
  }

  /**
   * Test CORS headers
   * @param {string} route - Route to test
   * @param {string} origin - Origin header value
   * @returns {Promise} Supertest request promise
   */
  testCORS(route, origin = "http://localhost:3000") {
    return request(this.app)
      .get(route)
      .set("Origin", origin);
  }

  /**
   * Test malformed JSON handling
   * @param {string} route - Route to test
   * @param {string} token - JWT token
   * @param {string} malformedJson - Malformed JSON string
   * @returns {Promise} Supertest request promise
   */
  testMalformedJson(route, token, malformedJson = "{ invalid json }") {
    return request(this.app)
      .post(route)
      .set("Content-Type", "application/json")
      .set("x-access-token", token)
      .send(malformedJson);
  }

  /**
   * Test invalid ObjectId formats
   * @param {string} baseRoute - Base route (e.g., '/api/users')
   * @param {Array} invalidIds - Array of invalid ID formats
   * @param {Array} expectedStatuses - Array of acceptable status codes
   * @returns {Promise} Promise that resolves when all tests complete
   */
  async testInvalidObjectIds(baseRoute, invalidIds = ["invalid", "123", "not-an-objectid"], expectedStatuses = [400, 404, 500]) {
    const results = [];
    
    for (const id of invalidIds) {
      const route = `${baseRoute}/${id}`;
      const res = await this.unauthenticatedGet(route);
      results.push({
        id,
        route,
        status: res.status,
        passed: expectedStatuses.includes(res.status)
      });
    }
    
    return results;
  }

  /**
   * Create a request with custom headers
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {object} headers - Custom headers
   * @param {object} data - Request body data
   * @returns {Promise} Supertest request promise
   */
  customRequest(method, url, headers = {}, data = null) {
    let req = request(this.app)[method.toLowerCase()](url);
    
    // Set custom headers
    Object.keys(headers).forEach(key => {
      req = req.set(key, headers[key]);
    });
    
    // Send data if provided
    if (data !== null) {
      req = req.send(data);
    }
    
    return req;
  }
}

// Export class (not singleton, as it needs app instance)
module.exports = RequestHelper;
