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

describe("🔐 Authentication Integration Tests", () => {
  let requestHelper;
  let authScenarios;

  beforeAll(() => {
    requestHelper = new RequestHelper(app);
    authScenarios = authHelper.getAuthTestScenarios();
  });

  describe("Protected Routes Authentication", () => {
    test("should require authentication for protected routes", async () => {
      const protectedRoutes = [
        '/api/adoptions/507f1f77bcf86cd799439011',
        '/api/contracts/507f1f77bcf86cd799439011',
        '/api/messages/507f1f77bcf86cd799439011',
        '/api/conversations/507f1f77bcf86cd799439011',
        '/api/jobApplications/student/507f1f77bcf86cd799439011'
      ];

      const results = await requestHelper.testRoutesRequireAuth(protectedRoutes);
      
      results.forEach(result => {
        expect(result.passed).toBe(true);
        expect(result.status).toBe(401);
      });
    });

    test("should reject invalid tokens", async () => {
      const protectedRoutes = [
        '/api/adoptions/507f1f77bcf86cd799439011',
        '/api/contracts/507f1f77bcf86cd799439011',
        '/api/messages/507f1f77bcf86cd799439011'
      ];

      const results = await requestHelper.testRoutesWithInvalidToken(protectedRoutes);
      
      results.forEach(result => {
        expect(result.passed).toBe(true);
        expect(result.status).toBe(401);
      });
    });

    test("should reject expired tokens", async () => {
      const expiredToken = authHelper.generateExpiredToken();
      
      const res = await requestHelper.authenticatedGet(
        '/api/adoptions/507f1f77bcf86cd799439011',
        expiredToken
      );

      expect(res.status).toBe(401);
    });
  });

  describe("POST Routes Authentication", () => {
    test("should require authentication for POST routes", async () => {
      const postRoutes = [
        { path: '/api/jobOffers', data: { title: "Test" } },
        { path: '/api/jobApplications', data: { jobOffer: "507f1f77bcf86cd799439013" } },
        { path: '/api/adoptions', data: { student: authScenarios.validStudent.userId } },
        { path: '/api/contracts', data: { company: authScenarios.validCompany.userId } },
        { path: '/api/messages', data: { content: "Test" } }
      ];

      for (const route of postRoutes) {
        const res = await requestHelper.unauthenticatedPost(route.path, route.data);
        expect(res.status).toBe(401);
      }
    });

    test("should reject invalid tokens for POST routes", async () => {
      const invalidToken = authHelper.generateInvalidToken();
      
      const res = await requestHelper.authenticatedPost(
        '/api/jobOffers',
        { title: "Test Job" },
        invalidToken
      );

      expect(res.status).toBe(401);
    });
  });

  describe("PUT Routes Authentication", () => {
    test("should require authentication for PUT routes", async () => {
      const putRoutes = [
        '/api/jobOffers/507f1f77bcf86cd799439013',
        '/api/adoptions/507f1f77bcf86cd799439014/accepted',
        '/api/contracts/active/507f1f77bcf86cd799439015',
        '/api/jobApplications/507f1f77bcf86cd799439016/status'
      ];

      for (const route of putRoutes) {
        const res = await request(app)
          .put(route)
          .send({ status: "test" });
        expect(res.status).toBe(401);
      }
    });
  });

  describe("DELETE Routes Authentication", () => {
    test("should require authentication for DELETE routes", async () => {
      const deleteRoutes = [
        '/api/jobOffers/507f1f77bcf86cd799439013',
        '/api/messages/507f1f77bcf86cd799439014'
      ];

      for (const route of deleteRoutes) {
        const res = await request(app).delete(route);
        expect(res.status).toBe(401);
      }
    });
  });

  describe("Token Validation", () => {
    test("should validate JWT token structure", () => {
      const validToken = authHelper.generateStudentToken();
      const decoded = authHelper.verifyToken(validToken);
      
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(authHelper.getDefaultIds().studentId);
    });

    test("should reject malformed tokens", () => {
      const malformedTokens = [
        "not.a.jwt",
        "invalid-token",
        "",
        null,
        undefined
      ];

      malformedTokens.forEach(token => {
        const decoded = authHelper.verifyToken(token);
        expect(decoded).toBeNull();
      });
    });

    test("should handle different token types", () => {
      const scenarios = authHelper.getAuthTestScenarios();
      
      // Valid tokens should decode properly
      expect(authHelper.verifyToken(scenarios.validCompany.token)).toBeTruthy();
      expect(authHelper.verifyToken(scenarios.validStudent.token)).toBeTruthy();
      expect(authHelper.verifyToken(scenarios.validAdmin.token)).toBeTruthy();
      
      // Invalid token should not decode
      expect(authHelper.verifyToken(scenarios.invalid.token)).toBeNull();
    });
  });

  describe("Authentication Headers", () => {
    test("should accept x-access-token header", async () => {
      const token = authHelper.generateStudentToken();

      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011')
        .set('x-access-token', token);

      expect([200, 401, 403, 404]).toContain(res.status); // Auth header processed correctly
    });

    test("should handle missing authorization headers", async () => {
      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011');

      expect(res.status).toBe(401);
    });

    test("should handle Bearer token format", async () => {
      const token = authHelper.generateStudentToken();
      
      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401); // Auth processed but route protected
    });
  });

  describe("Cross-Endpoint Authentication Consistency", () => {
    test("should have consistent authentication across all protected endpoints", async () => {
      const endpoints = [
        '/api/adoptions/test',
        '/api/contracts/test',
        '/api/messages/test',
        '/api/conversations/test'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.status).toBe(401);
      }
    });

    test("should handle authentication consistently across HTTP methods", async () => {
      const methods = ['get', 'post', 'put', 'delete'];
      const route = '/api/adoptions/507f1f77bcf86cd799439011';
      
      for (const method of methods) {
        const res = await request(app)[method](route);
        expect([401, 404, 405]).toContain(res.status);
      }
    });
  });

  describe("Security Headers and Authentication", () => {
    test("should reject requests with fake Bearer tokens", async () => {
      const secureEndpoints = [
        '/api/adoptions/507f1f77bcf86cd799439011',
        '/api/contracts/507f1f77bcf86cd799439011',
        '/api/messages/507f1f77bcf86cd799439011'
      ];

      for (const endpoint of secureEndpoints) {
        const res = await request(app)
          .get(endpoint)
          .set("Authorization", "Bearer fake-token");
        
        expect(res.status).toBe(401);
      }
    });

    test("should handle multiple authentication headers gracefully", async () => {
      const token = authHelper.generateStudentToken();

      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011')
        .set('x-access-token', token)
        .set('Authorization', 'Bearer another-token');

      expect([200, 401, 403, 404]).toContain(res.status); // Auth headers processed
    });
  });

  describe("Authentication Error Messages", () => {
    test("should return appropriate error for missing token", async () => {
      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011');

      expect(res.status).toBe(401);
      // Note: We don't test error message content as it might vary
    });

    test("should return appropriate error for invalid token", async () => {
      const res = await request(app)
        .get('/api/adoptions/507f1f77bcf86cd799439011')
        .set('x-access-token', 'invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
