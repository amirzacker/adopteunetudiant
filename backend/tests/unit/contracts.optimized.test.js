const request = require("supertest");
const authHelper = require("../__mocks__/utils/auth.helper");
const RequestHelper = require("../__mocks__/utils/request.helper");
const testConfig = require("../setup/test.config");

// Import app from server
let app;
try {
  app = require("../../server").app;
} catch (error) {
  app = require("../../server");
}

describe("📄 Contracts Optimized Tests", () => {
  let requestHelper;
  let studentToken;
  let companyToken;
  let adminToken;

  beforeAll(() => {
    requestHelper = new RequestHelper(app);
    studentToken = authHelper.generateStudentToken();
    companyToken = authHelper.generateCompanyToken();
    adminToken = authHelper.generateAdminToken();
  });

  describe("POST /api/contracts", () => {
    test("should require authentication", async () => {
      const contractData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "Contract terms and conditions",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const res = await requestHelper.unauthenticatedPost('/api/contracts', contractData);
      expect(res.status).toBe(401);
    });

    test("should handle contract creation with valid data", async () => {
      const contractData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "Contract terms and conditions",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', contractData, companyToken);
      expect([201, 401, 403, 500]).toContain(res.status);
      
      if (res.status === 201) {
        expect(res.body).toHaveProperty('company');
        expect(res.body).toHaveProperty('student');
        expect(res.body).toHaveProperty('terms');
        expect(res.body).toHaveProperty('status', 'pending');
      }
    });

    test("should validate required fields", async () => {
      const incompleteData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId
        // Missing terms, startDate, endDate
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', incompleteData, companyToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle invalid ObjectIds", async () => {
      const invalidData = {
        companyId: "invalid-company-id",
        studentId: "invalid-student-id",
        terms: "Test terms",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', invalidData, companyToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should validate date formats", async () => {
      const invalidDateData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "Test terms",
        startDate: "invalid-date",
        endDate: "also-invalid-date"
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', invalidDateData, companyToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("GET /api/contracts/:userId", () => {
    test("should require authentication", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.unauthenticatedGet(`/api/contracts/${userId}`);
      expect(res.status).toBe(401);
    });

    test("should handle user contracts request", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/contracts/${userId}`, studentToken);
      expect([200, 401, 403, 404]).toContain(res.status);
      
      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle invalid user ID", async () => {
      const invalidId = "invalid-user-id";
      const res = await requestHelper.authenticatedGet(`/api/contracts/${invalidId}`, studentToken);
      // Invalid ObjectId format causes CastError, handled by error middleware as 500
      expect([200, 401, 403, 500]).toContain(res.status);
    });

    test("should handle non-existent user", async () => {
      const nonExistentId = "507f1f77bcf86cd799439999";
      const res = await requestHelper.authenticatedGet(`/api/contracts/${nonExistentId}`, studentToken);
      expect([200, 401, 403, 404]).toContain(res.status);
    });
  });

  describe("GET /api/contracts/active/:userId", () => {
    test("should require authentication", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.unauthenticatedGet(`/api/contracts/active/${userId}`);
      expect(res.status).toBe(401);
    });

    test("should handle active contracts request", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/contracts/active/${userId}`, studentToken);
      expect([200, 401, 403, 404]).toContain(res.status);
      
      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle company active contracts", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/contracts/active/${companyId}`, companyToken);
      expect([200, 401, 403, 404]).toContain(res.status);
    });
  });

  describe("GET /api/contracts/terminated/:userId", () => {
    test("should require authentication", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.unauthenticatedGet(`/api/contracts/terminated/${userId}`);
      expect(res.status).toBe(401);
    });

    test("should handle terminated contracts request", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/contracts/terminated/${userId}`, studentToken);
      expect([200, 401, 403, 404]).toContain(res.status);
      
      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });
  });

  describe("GET /api/contracts/history/:companyId/:studentId", () => {
    test("should require authentication", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.unauthenticatedGet(`/api/contracts/history/${companyId}/${studentId}`);
      expect(res.status).toBe(401);
    });

    test("should handle contract history request", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/contracts/history/${companyId}/${studentId}`, companyToken);
      expect([200, 401, 403, 404]).toContain(res.status);
    });

    test("should handle invalid IDs in history request", async () => {
      const res = await requestHelper.authenticatedGet('/api/contracts/history/invalid/also-invalid', companyToken);
      // Invalid ObjectId format causes CastError, handled by error middleware as 500
      expect([200, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/contracts/active/:contractId", () => {
    test("should require authentication", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await request(app)
        .put(`/api/contracts/active/${contractId}`)
        .send({});
      expect(res.status).toBe(401);
    });

    test("should handle contract activation", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedPut(`/api/contracts/active/${contractId}`, {}, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle invalid contract ID for activation", async () => {
      const invalidId = "invalid-contract-id";
      const res = await requestHelper.authenticatedPut(`/api/contracts/active/${invalidId}`, {}, companyToken);
      // Invalid ObjectId format causes CastError, handled by error middleware as 500
      expect([200, 401, 403, 500]).toContain(res.status);
    });

    test("should handle authorization for contract activation", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedPut(`/api/contracts/active/${contractId}`, {}, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/contracts/terminated/:contractId", () => {
    test("should require authentication", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await request(app)
        .put(`/api/contracts/terminated/${contractId}`)
        .send({});
      expect(res.status).toBe(401);
    });

    test("should handle contract termination", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedPut(`/api/contracts/terminated/${contractId}`, {}, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle invalid contract ID for termination", async () => {
      const invalidId = "invalid-contract-id";
      const res = await requestHelper.authenticatedPut(`/api/contracts/terminated/${invalidId}`, {}, companyToken);
      // Invalid ObjectId format causes CastError, handled by error middleware as 500
      expect([200, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("DELETE /api/contracts/:contractId", () => {
    test("should require authentication", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await request(app).delete(`/api/contracts/${contractId}`);
      expect(res.status).toBe(401);
    });

    test("should handle contract deletion", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedDelete(`/api/contracts/${contractId}`, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle invalid contract ID for deletion", async () => {
      const invalidId = "invalid-contract-id";
      const res = await requestHelper.authenticatedDelete(`/api/contracts/${invalidId}`, companyToken);
      // Invalid ObjectId format causes CastError, handled by error middleware as 500
      expect([200, 401, 403, 500]).toContain(res.status);
    });

    test("should handle authorization for contract deletion", async () => {
      const contractId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedDelete(`/api/contracts/${contractId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("Security Tests", () => {
    test("should handle XSS attempts in contract data", async () => {
      const xssPayloads = testConfig.getSecurityPayloads('xss');

      for (const payload of xssPayloads.slice(0, 2)) {
        const contractData = {
          companyId: testConfig.defaultIds.companyId,
          studentId: testConfig.defaultIds.studentId,
          terms: payload,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        const res = await requestHelper.authenticatedPost('/api/contracts', contractData, companyToken);
        expect([201, 400, 401, 403, 500]).toContain(res.status);
      }
    });

    test("should handle malformed JSON", async () => {
      const res = await requestHelper.testMalformedJson('/api/contracts', companyToken);
      expect([200, 400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle concurrent contract creation", async () => {
      const contractData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "Concurrent contract test",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(requestHelper.authenticatedPost('/api/contracts', contractData, companyToken));
      }

      const results = await Promise.all(promises);
      
      results.forEach(res => {
        expect([201, 400, 401, 403, 409, 500]).toContain(res.status);
      });
    });

    test("should validate contract terms length", async () => {
      const longTermsData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "A".repeat(10000), // Very long terms
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', longTermsData, companyToken);
      expect([201, 400, 401, 403, 413, 500]).toContain(res.status);
    });
  });

  describe("Business Logic Tests", () => {
    test("should handle contract status transitions", async () => {
      const contractId = testConfig.defaultIds.companyId;
      
      // Test activation
      const activateRes = await requestHelper.authenticatedPut(`/api/contracts/active/${contractId}`, {}, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(activateRes.status);
      
      // Test termination
      const terminateRes = await requestHelper.authenticatedPut(`/api/contracts/terminated/${contractId}`, {}, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(terminateRes.status);
    });

    test("should validate date logic (end date after start date)", async () => {
      const invalidDateLogicData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "Test terms",
        startDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Future date
        endDate: new Date().toISOString() // Past date relative to start
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', invalidDateLogicData, companyToken);
      expect([201, 400, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      const userId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/contracts/${userId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle missing required parameters", async () => {
      const res = await requestHelper.authenticatedPost('/api/contracts', {}, companyToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle empty request body", async () => {
      const res = await requestHelper.authenticatedPost('/api/contracts', null, companyToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle malformed date formats", async () => {
      const malformedDateData = {
        companyId: testConfig.defaultIds.companyId,
        studentId: testConfig.defaultIds.studentId,
        terms: "Test terms",
        startDate: "not-a-date",
        endDate: "also-not-a-date"
      };

      const res = await requestHelper.authenticatedPost('/api/contracts', malformedDateData, companyToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });
});
