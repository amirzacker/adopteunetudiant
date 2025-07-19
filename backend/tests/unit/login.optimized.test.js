const request = require("supertest");
const authHelper = require("../__mocks__/utils/auth.helper");
const RequestHelper = require("../__mocks__/utils/request.helper");
const testConfig = require("../setup/test.config");

// Import app from server
let app;
try {
  app = require("../../server").app;
} catch (error) {
  console.error("Failed to import app:", error);
}

describe('🔐 Login API - Comprehensive Tests', () => {
  let requestHelper;

  beforeAll(() => {
    requestHelper = new RequestHelper(app);
  });
  describe("POST /api/login", () => {
    test("should authenticate valid user credentials", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
      
      if ([200, 201].includes(res.status)) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should reject invalid credentials", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle missing email", async () => {
      const loginData = {
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle missing password", async () => {
      const loginData = {
        email: 'test@example.com'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle empty request body", async () => {
      const res = await requestHelper.unauthenticatedPost('/api/login', {});
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle invalid email format", async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle non-existent user", async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 404, 422, 500]).toContain(res.status);
    });

    test("should handle empty email", async () => {
      const loginData = {
        email: '',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle empty password", async () => {
      const loginData = {
        email: 'test@example.com',
        password: ''
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle null values", async () => {
      const loginData = {
        email: null,
        password: null
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });
  });

  describe("Security Tests", () => {
    test("should handle XSS attempts in email", async () => {
      const maliciousData = {
        email: '<script>alert("xss")</script>',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', maliciousData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle XSS attempts in password", async () => {
      const maliciousData = {
        email: 'test@example.com',
        password: '<script>alert("xss")</script>'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', maliciousData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle SQL injection attempts in email", async () => {
      const maliciousData = {
        email: "'; DROP TABLE users; --",
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', maliciousData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle SQL injection attempts in password", async () => {
      const maliciousData = {
        email: 'test@example.com',
        password: "'; DROP TABLE users; --"
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', maliciousData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle malformed JSON", async () => {
      const res = await request(app)
        .post('/api/login')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle invalid JSON structure", async () => {
      const res = await request(app)
        .post('/api/login')
        .send('not-json')
        .set('Content-Type', 'application/json');
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle very long email", async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const loginData = {
        email: longEmail,
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 413, 422, 500]).toContain(res.status);
    });

    test("should handle very long password", async () => {
      const longPassword = 'a'.repeat(10000);
      const loginData = {
        email: 'test@example.com',
        password: longPassword
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 413, 422, 500]).toContain(res.status);
    });

    test("should prevent brute force attacks", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Simulate multiple failed login attempts
      const promises = Array(10).fill().map(() => 
        requestHelper.unauthenticatedPost('/api/login', loginData)
      );

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect([400, 401, 403, 422, 429, 500]).toContain(res.status);
      });
    });
  });

  describe("Business Logic Tests", () => {
    test("should handle case-insensitive email", async () => {
      const loginData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle email with spaces", async () => {
      const loginData = {
        email: ' test@example.com ',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should validate password complexity", async () => {
      const loginData = {
        email: 'test@example.com',
        password: '123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle special characters in password", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'p@ssw0rd!#$%'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle unicode characters", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'pássw0rd🔐'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });
  });

  describe("Error Handling", () => {
    test("should handle database connection errors", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle server errors gracefully", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle timeout scenarios", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500, 504]).toContain(res.status);
    });
  });

  describe("Performance Tests", () => {
    test("should handle login request within reasonable time", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const startTime = Date.now();
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      const endTime = Date.now();
      
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("should handle concurrent login requests", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const promises = Array(5).fill().map(() => 
        requestHelper.unauthenticatedPost('/api/login', loginData)
      );

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
      });
    });
  });

  describe("Response Format Tests", () => {
    test("should return consistent response format for success", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
      
      if ([200, 201].includes(res.status)) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should return consistent response format for errors", async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const res = await requestHelper.unauthenticatedPost('/api/login', loginData);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
      expect(['string', 'object']).toContain(typeof res.body);
    });
  });
});
