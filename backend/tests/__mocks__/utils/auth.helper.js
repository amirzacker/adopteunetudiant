const jwt = require("jsonwebtoken");
const config = require("../../../config");

/**
 * Authentication Helper for Tests
 * Provides centralized JWT token management for testing
 */
class AuthHelper {
  constructor() {
    this.defaultCompanyId = "507f1f77bcf86cd799439011";
    this.defaultStudentId = "507f1f77bcf86cd799439012";
    this.defaultAdminId = "507f1f77bcf86cd799439013";
  }

  /**
   * Generate a JWT token for testing
   * @param {string} userId - User ID to include in token
   * @param {object} additionalPayload - Additional payload data
   * @returns {string} JWT token
   */
  generateToken(userId, additionalPayload = {}) {
    const payload = {
      userId,
      ...additionalPayload
    };
    return jwt.sign(payload, config.secretJwtToken);
  }

  /**
   * Generate a company token
   * @param {string} companyId - Company ID (optional)
   * @returns {string} JWT token
   */
  generateCompanyToken(companyId = this.defaultCompanyId) {
    return this.generateToken(companyId, { 
      role: 'company',
      type: 'company'
    });
  }

  /**
   * Generate a student token
   * @param {string} studentId - Student ID (optional)
   * @returns {string} JWT token
   */
  generateStudentToken(studentId = this.defaultStudentId) {
    return this.generateToken(studentId, { 
      role: 'student',
      type: 'student'
    });
  }

  /**
   * Generate an admin token
   * @param {string} adminId - Admin ID (optional)
   * @returns {string} JWT token
   */
  generateAdminToken(adminId = this.defaultAdminId) {
    return this.generateToken(adminId, { 
      role: 'admin',
      type: 'admin'
    });
  }

  /**
   * Generate an invalid token for testing error cases
   * @returns {string} Invalid JWT token
   */
  generateInvalidToken() {
    return "invalid-jwt-token-for-testing";
  }

  /**
   * Generate an expired token for testing
   * @param {string} userId - User ID
   * @returns {string} Expired JWT token
   */
  generateExpiredToken(userId = this.defaultStudentId) {
    return jwt.sign(
      { userId },
      config.secretJwtToken,
      { expiresIn: '-1h' } // Expired 1 hour ago
    );
  }

  /**
   * Get default test user IDs
   * @returns {object} Object containing default IDs
   */
  getDefaultIds() {
    return {
      companyId: this.defaultCompanyId,
      studentId: this.defaultStudentId,
      adminId: this.defaultAdminId
    };
  }

  /**
   * Create authorization headers for requests
   * @param {string} token - JWT token
   * @returns {object} Headers object
   */
  createAuthHeaders(token) {
    return {
      'x-access-token': token,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create authorization headers with Bearer token
   * @param {string} token - JWT token
   * @returns {object} Headers object
   */
  createBearerAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get common test scenarios for authentication
   * @returns {object} Test scenarios
   */
  getAuthTestScenarios() {
    return {
      validCompany: {
        token: this.generateCompanyToken(),
        userId: this.defaultCompanyId,
        role: 'company'
      },
      validStudent: {
        token: this.generateStudentToken(),
        userId: this.defaultStudentId,
        role: 'student'
      },
      validAdmin: {
        token: this.generateAdminToken(),
        userId: this.defaultAdminId,
        role: 'admin'
      },
      invalid: {
        token: this.generateInvalidToken(),
        userId: null,
        role: null
      },
      expired: {
        token: this.generateExpiredToken(),
        userId: this.defaultStudentId,
        role: 'student'
      },
      missing: {
        token: null,
        userId: null,
        role: null
      }
    };
  }

  /**
   * Verify if a token is valid (for testing purposes)
   * @param {string} token - JWT token to verify
   * @returns {object|null} Decoded token or null if invalid
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.secretJwtToken);
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
module.exports = new AuthHelper();
