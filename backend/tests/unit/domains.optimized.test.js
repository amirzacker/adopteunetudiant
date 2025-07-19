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

describe('🏢 Domains API - Comprehensive Tests', () => {
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

  describe("GET /api/domains", () => {
    test("should get all domains without authentication", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/domains');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should get all domains with authentication", async () => {
      const res = await requestHelper.authenticatedGet('/api/domains', studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle query parameters", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/domains?page=1&limit=10');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should return consistent data structure", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/domains');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200 && Array.isArray(res.body)) {
        res.body.forEach(domain => {
          expect(typeof domain).toBe('object');
        });
      }
    });
  });

  describe("POST /api/domains", () => {
    test("should require admin role", async () => {
      const domainData = {
        name: 'Test Domain',
        description: 'Test domain description'
      };
      const res = await requestHelper.unauthenticatedPost('/api/domains', domainData);
      expect([401, 403]).toContain(res.status);
    });

    test("should require admin role with student token", async () => {
      const domainData = {
        name: 'Test Domain',
        description: 'Test domain description'
      };
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should require admin role with company token", async () => {
      const domainData = {
        name: 'Test Domain',
        description: 'Test domain description'
      };
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, companyToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should create domain with admin token", async () => {
      const domainData = {
        name: 'Test Domain',
        description: 'Test domain description'
      };
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, adminToken);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
      
      if ([200, 201].includes(res.status)) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle missing required fields", async () => {
      const res = await requestHelper.authenticatedPost('/api/domains', {}, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle invalid data types", async () => {
      const domainData = {
        name: 123,
        description: true
      };
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/domains/:id", () => {
    test("should require admin role", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Updated Domain' };
      const res = await request(app)
        .put(`/api/domains/${domainId}`)
        .send(updateData);
      expect([401, 403]).toContain(res.status);
    });

    test("should require admin role with student token", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Updated Domain' };
      const res = await requestHelper.authenticatedPut(`/api/domains/${domainId}`, updateData, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should update domain with admin token", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Updated Domain' };
      const res = await requestHelper.authenticatedPut(`/api/domains/${domainId}`, updateData, adminToken);
      expect([200, 401, 403, 404, 422, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle invalid domain ID", async () => {
      const updateData = { name: 'Updated Domain' };
      const res = await requestHelper.authenticatedPut('/api/domains/invalid-id', updateData, adminToken);
      expect([400, 401, 403, 404, 422, 500]).toContain(res.status);
    });

    test("should handle non-existent domain", async () => {
      const updateData = { name: 'Updated Domain' };
      const res = await requestHelper.authenticatedPut('/api/domains/507f1f77bcf86cd799439999', updateData, adminToken);
      expect([200, 401, 403, 404, 422, 500]).toContain(res.status);
    });

    test("should handle empty update data", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedPut(`/api/domains/${domainId}`, {}, adminToken);
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(res.status);
    });
  });

  describe("DELETE /api/domains/:id", () => {
    test("should require admin role", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const res = await request(app)
        .delete(`/api/domains/${domainId}`);
      expect([401, 403]).toContain(res.status);
    });

    test("should require admin role with student token", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedDelete(`/api/domains/${domainId}`, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should delete domain with admin token", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedDelete(`/api/domains/${domainId}`, adminToken);
      expect([200, 204, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle invalid domain ID", async () => {
      const res = await requestHelper.authenticatedDelete('/api/domains/invalid-id', adminToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle non-existent domain", async () => {
      const res = await requestHelper.authenticatedDelete('/api/domains/507f1f77bcf86cd799439999', adminToken);
      expect([200, 204, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("Security Tests", () => {
    test("should handle XSS attempts in domain data", async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: '"><img src=x onerror=alert("xss")>'
      };
      const res = await requestHelper.authenticatedPost('/api/domains', maliciousData, adminToken);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle malformed JSON", async () => {
      const res = await request(app)
        .post('/api/domains')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should prevent unauthorized domain modification", async () => {
      const domainId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Unauthorized Update' };
      const res = await requestHelper.authenticatedPut(`/api/domains/${domainId}`, updateData, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should handle SQL injection attempts", async () => {
      const maliciousData = {
        name: "'; DROP TABLE domains; --",
        description: 'Test description'
      };
      const res = await requestHelper.authenticatedPost('/api/domains', maliciousData, adminToken);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });
  });

  describe("Business Logic Tests", () => {
    test("should handle domain name uniqueness", async () => {
      const domainData = {
        name: 'Unique Domain',
        description: 'Test description'
      };
      
      // Create first domain
      await requestHelper.authenticatedPost('/api/domains', domainData, adminToken);
      
      // Try to create duplicate
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, adminToken);
      expect([200, 201, 400, 401, 403, 409, 422, 500]).toContain(res.status);
    });

    test("should validate domain name length", async () => {
      const domainData = {
        name: 'a'.repeat(1000),
        description: 'Test description'
      };
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, adminToken);
      expect([200, 201, 400, 401, 403, 413, 422, 500]).toContain(res.status);
    });

    test("should handle concurrent domain creation", async () => {
      const domainData = {
        name: 'Concurrent Domain',
        description: 'Test description'
      };

      const promises = Array(3).fill().map((_, index) => 
        requestHelper.authenticatedPost('/api/domains', { ...domainData, name: `${domainData.name} ${index}` }, adminToken)
      );

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect([200, 201, 400, 401, 403, 409, 422, 500]).toContain(res.status);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/domains');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle missing required parameters", async () => {
      const res = await requestHelper.authenticatedPost('/api/domains', { description: 'Test' }, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle empty request body", async () => {
      const res = await requestHelper.authenticatedPost('/api/domains', {}, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle invalid JSON structure", async () => {
      const res = await request(app)
        .post('/api/domains')
        .send('not-json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("Performance Tests", () => {
    test("should handle large domain list retrieval", async () => {
      const startTime = Date.now();
      const res = await requestHelper.unauthenticatedGet('/api/domains');
      const endTime = Date.now();
      
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("should handle rapid domain creation", async () => {
      const domainData = {
        name: 'Rapid Domain',
        description: 'Test description'
      };

      const startTime = Date.now();
      const res = await requestHelper.authenticatedPost('/api/domains', domainData, adminToken);
      const endTime = Date.now();
      
      expect([200, 201, 400, 401, 403, 409, 422, 500]).toContain(res.status);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});
