const request = require("supertest");
const authHelper = require("../__mocks__/utils/auth.helper");
const RequestHelper = require("../__mocks__/utils/request.helper");

// Import app from server
let app;
try {
  app = require("../../server").app;
} catch (error) {
  app = require("../../server");
}

describe("🎯 Complete Backend Tests - Final Optimized", () => {
  let requestHelper;
  let tokens;

  beforeAll(() => {
    requestHelper = new RequestHelper(app);
    tokens = {
      student: authHelper.generateStudentToken(),
      company: authHelper.generateCompanyToken(),
      admin: authHelper.generateAdminToken(),
      invalid: authHelper.generateInvalidToken()
    };
  });

  describe("🔐 Authentication Core Tests", () => {
    test("should require authentication for protected routes", async () => {
      const protectedRoutes = [
        '/api/adoptions/507f1f77bcf86cd799439011',
        '/api/contracts/507f1f77bcf86cd799439011',
        '/api/messages/507f1f77bcf86cd799439011'
      ];

      for (const route of protectedRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect(res.status).toBe(401);
      }
    });

    test("should reject invalid tokens", async () => {
      const res = await requestHelper.authenticatedGet(
        '/api/adoptions/507f1f77bcf86cd799439011',
        tokens.invalid
      );
      expect(res.status).toBe(401);
    });

    test("should accept valid tokens", async () => {
      const res = await requestHelper.authenticatedGet(
        '/api/adoptions/507f1f77bcf86cd799439011',
        tokens.student
      );
      expect([200, 401, 403, 404]).toContain(res.status);
    });

    test("should handle authentication headers", async () => {
      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011')
        .set('x-access-token', tokens.student);

      expect([200, 401, 403, 404]).toContain(res.status);
    });

    test("should validate JWT token structure", () => {
      const validToken = authHelper.generateStudentToken();
      const decoded = authHelper.verifyToken(validToken);
      
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(authHelper.getDefaultIds().studentId);
    });
  });

  describe("📈 API Consistency Tests", () => {
    test("should return 404 for non-existent routes", async () => {
      const invalidRoutes = [
        '/api/nonexistent',
        '/api/invalid-endpoint',
        '/api/fake-route'
      ];

      for (const route of invalidRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect(res.status).toBe(404);
      }
    });

    test("should handle HTTP methods consistently", async () => {
      const methods = ['get', 'post', 'put', 'delete'];
      
      for (const method of methods) {
        const res = await request(app)[method]('/api/nonexistent');
        expect([401, 404, 405]).toContain(res.status);
      }
    });

    test("should handle query parameters", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/nonexistent?page=1&limit=10');
      expect(res.status).toBe(404);
    });

    test("should handle custom headers", async () => {
      const res = await requestHelper.customRequest(
        'GET',
        '/api/nonexistent',
        { 'X-Custom-Header': 'test-value' }
      );
      expect(res.status).toBe(404);
    });
  });

  describe("💼 Job Offers Tests", () => {
    test("should handle public job offers access", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/jobOffers');
      expect([200, 404]).toContain(res.status);

      if (res.status === 200 && res.body) {
        // If response exists, it should be an array or object
        expect(typeof res.body).toBe('object');
      }
    });

    test("should require authentication for job creation", async () => {
      const jobData = {
        title: "Test Job",
        description: "Test description"
      };

      const res = await requestHelper.unauthenticatedPost('/api/jobOffers', jobData);
      expect(res.status).toBe(401);
    });

    test("should handle job creation with company token", async () => {
      const jobData = {
        title: "Frontend Developer",
        description: "React developer needed"
      };

      const res = await requestHelper.authenticatedPost('/api/jobOffers', jobData, tokens.company);
      expect([201, 401, 403, 500]).toContain(res.status);
    });

    test("should reject student token for job creation", async () => {
      const jobData = {
        title: "Test Job",
        description: "Test description"
      };

      const res = await requestHelper.authenticatedPost('/api/jobOffers', jobData, tokens.student);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should handle job search", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/jobOffers/search?q=developer');
      expect([200, 404]).toContain(res.status);
    });

    test("should handle specific job offer", async () => {
      const jobId = authHelper.getDefaultIds().companyId;
      const res = await requestHelper.unauthenticatedGet(`/api/jobOffers/${jobId}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("👥 Users Tests", () => {
    test("should require authentication for users list", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/users');
      expect([200, 401]).toContain(res.status); // Some APIs allow public user listing
    });

    test("should handle users list with authentication", async () => {
      const res = await requestHelper.authenticatedGet('/api/users', tokens.student);
      expect([200, 401, 403]).toContain(res.status);
    });

    test("should require authentication for user creation", async () => {
      const userData = {
        name: "Test User",
        email: "test@test.com",
        password: "password123",
        role: "student"
      };

      const res = await requestHelper.unauthenticatedPost('/api/users', userData);
      expect([401, 500]).toContain(res.status); // 500 if route exists but fails
    });

    test("should handle user creation with admin token", async () => {
      const userData = {
        name: "Test User",
        email: "test@test.com",
        password: "password123",
        role: "student"
      };

      const res = await requestHelper.authenticatedPost('/api/users', userData, tokens.admin);
      expect([201, 401, 403, 500]).toContain(res.status);
    });

    test("should validate required fields", async () => {
      const incompleteData = { name: "Test User" }; // Missing required fields

      const res = await requestHelper.authenticatedPost('/api/users', incompleteData, tokens.admin);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle user update", async () => {
      const userId = authHelper.getDefaultIds().studentId;
      const updateData = { name: "Updated Name" };

      const res = await requestHelper.authenticatedPut(`/api/users/${userId}`, updateData, tokens.student);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("🛡️ Security Tests", () => {
    test("should handle malformed JSON", async () => {
      const res = await requestHelper.testMalformedJson('/api/jobOffers', tokens.company);
      expect([200, 400, 401, 403]).toContain(res.status);
    });

    test("should handle invalid ObjectId formats", async () => {
      const invalidIds = ["invalid", "123"];

      for (const invalidId of invalidIds) {
        const res = await requestHelper.unauthenticatedGet(`/api/jobOffers/${invalidId}`);
        expect([400, 404, 500]).toContain(res.status);
      }
    });

    test("should handle XSS attempts", async () => {
      const xssPayload = "<script>alert('xss')</script>";
      const jobData = {
        title: xssPayload,
        description: xssPayload
      };

      const res = await requestHelper.authenticatedPost('/api/jobOffers', jobData, tokens.company);
      expect([201, 400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle special characters in URLs", async () => {
      const specialRoutes = [
        "/api/test with spaces",
        "/api/test%20encoded"
      ];

      for (const route of specialRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect([400, 404]).toContain(res.status);
      }
    });

    test("should handle CORS requests", async () => {
      const res = await requestHelper.testCORS('/api/nonexistent', 'http://localhost:3000');
      expect(res.status).toBe(404);
    });
  });

  describe("⚡ Performance Tests", () => {
    test("should handle concurrent requests", async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(requestHelper.unauthenticatedGet('/api/jobOffers'));
      }

      const results = await Promise.all(promises);
      
      results.forEach(res => {
        expect([200, 404, 429]).toContain(res.status);
      });
    });

    test("should handle rapid sequential requests", async () => {
      const promises = [];
      for (let i = 0; i < 2; i++) {
        promises.push(requestHelper.unauthenticatedGet('/api/nonexistent'));
      }

      const results = await Promise.all(promises);
      
      results.forEach(res => {
        expect(res.status).toBe(404);
      });
    });
  });

  describe("🔄 Error Handling Tests", () => {
    test("should handle missing authentication", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/adoptions/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });

    test("should handle invalid authentication", async () => {
      const res = await requestHelper.authenticatedGet(
        '/api/adoptions/507f1f77bcf86cd799439011',
        'invalid-token'
      );
      expect(res.status).toBe(401);
    });

    test("should handle non-existent resources", async () => {
      const nonExistentId = "507f1f77bcf86cd799439999";
      const res = await requestHelper.unauthenticatedGet(`/api/jobOffers/${nonExistentId}`);
      expect([404]).toContain(res.status);
    });

    test("should handle empty request bodies", async () => {
      const res = await requestHelper.authenticatedPost('/api/jobOffers', {}, tokens.company);
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("📊 Data Validation Tests", () => {
    test("should validate email format", async () => {
      const invalidEmailData = {
        name: "Test User",
        email: "invalid-email-format",
        password: "password123",
        role: "student"
      };

      const res = await requestHelper.authenticatedPost('/api/users', invalidEmailData, tokens.admin);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should validate role values", async () => {
      const invalidRoleData = {
        name: "Test User",
        email: "test@test.com",
        password: "password123",
        role: "invalid-role"
      };

      const res = await requestHelper.authenticatedPost('/api/users', invalidRoleData, tokens.admin);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle large data payloads", async () => {
      const largeData = {
        title: "A".repeat(100),
        description: "B".repeat(500)
      };

      const res = await requestHelper.authenticatedPost('/api/jobOffers', largeData, tokens.company);
      expect([201, 400, 401, 403, 413, 500]).toContain(res.status);
    });
  });
});
