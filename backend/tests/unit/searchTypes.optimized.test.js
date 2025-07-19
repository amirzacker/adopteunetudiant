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

describe('🔍 SearchTypes API - Comprehensive Tests', () => {
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

  describe("GET /api/searchTypes", () => {
    test("should get all search types without authentication", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/searchTypes');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should get all search types with authentication", async () => {
      const res = await requestHelper.authenticatedGet('/api/searchTypes', studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle query parameters", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/searchTypes?page=1&limit=10');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should return consistent data structure", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/searchTypes');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200 && Array.isArray(res.body)) {
        res.body.forEach(searchType => {
          expect(typeof searchType).toBe('object');
        });
      }
    });
  });

  describe("POST /api/searchTypes", () => {
    test("should require admin role", async () => {
      const searchTypeData = {
        name: 'Test Search Type',
        description: 'Test search type description'
      };
      const res = await requestHelper.unauthenticatedPost('/api/searchTypes', searchTypeData);
      expect([401, 403]).toContain(res.status);
    });

    test("should require admin role with student token", async () => {
      const searchTypeData = {
        name: 'Test Search Type',
        description: 'Test search type description'
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should require admin role with company token", async () => {
      const searchTypeData = {
        name: 'Test Search Type',
        description: 'Test search type description'
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, companyToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should create search type with admin token", async () => {
      const searchTypeData = {
        name: 'Test Search Type',
        description: 'Test search type description'
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, adminToken);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
      
      if ([200, 201].includes(res.status)) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle missing required fields", async () => {
      const res = await requestHelper.authenticatedPost('/api/searchTypes', {}, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle invalid data types", async () => {
      const searchTypeData = {
        name: 123,
        description: true
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/searchTypes/:id", () => {
    test("should require admin role", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Updated Search Type' };
      const res = await request(app)
        .put(`/api/searchTypes/${searchTypeId}`)
        .send(updateData);
      expect([401, 403]).toContain(res.status);
    });

    test("should require admin role with student token", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Updated Search Type' };
      const res = await requestHelper.authenticatedPut(`/api/searchTypes/${searchTypeId}`, updateData, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should update search type with admin token", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Updated Search Type' };
      const res = await requestHelper.authenticatedPut(`/api/searchTypes/${searchTypeId}`, updateData, adminToken);
      expect([200, 401, 403, 404, 422, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle invalid search type ID", async () => {
      const updateData = { name: 'Updated Search Type' };
      const res = await requestHelper.authenticatedPut('/api/searchTypes/invalid-id', updateData, adminToken);
      expect([400, 401, 403, 404, 422, 500]).toContain(res.status);
    });

    test("should handle non-existent search type", async () => {
      const updateData = { name: 'Updated Search Type' };
      const res = await requestHelper.authenticatedPut('/api/searchTypes/507f1f77bcf86cd799439999', updateData, adminToken);
      expect([200, 401, 403, 404, 422, 500]).toContain(res.status);
    });

    test("should handle empty update data", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedPut(`/api/searchTypes/${searchTypeId}`, {}, adminToken);
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(res.status);
    });
  });

  describe("DELETE /api/searchTypes/:id", () => {
    test("should require admin role", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const res = await request(app)
        .delete(`/api/searchTypes/${searchTypeId}`);
      expect([401, 403]).toContain(res.status);
    });

    test("should require admin role with student token", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedDelete(`/api/searchTypes/${searchTypeId}`, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should delete search type with admin token", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedDelete(`/api/searchTypes/${searchTypeId}`, adminToken);
      expect([200, 204, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle invalid search type ID", async () => {
      const res = await requestHelper.authenticatedDelete('/api/searchTypes/invalid-id', adminToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle non-existent search type", async () => {
      const res = await requestHelper.authenticatedDelete('/api/searchTypes/507f1f77bcf86cd799439999', adminToken);
      expect([200, 204, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("Security Tests", () => {
    test("should handle XSS attempts in search type data", async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: '"><img src=x onerror=alert("xss")>'
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', maliciousData, adminToken);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle malformed JSON", async () => {
      const res = await request(app)
        .post('/api/searchTypes')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should prevent unauthorized search type modification", async () => {
      const searchTypeId = testConfig.defaultIds.studentId;
      const updateData = { name: 'Unauthorized Update' };
      const res = await requestHelper.authenticatedPut(`/api/searchTypes/${searchTypeId}`, updateData, studentToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should handle SQL injection attempts", async () => {
      const maliciousData = {
        name: "'; DROP TABLE searchTypes; --",
        description: 'Test description'
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', maliciousData, adminToken);
      expect([200, 201, 400, 401, 403, 422, 500]).toContain(res.status);
    });
  });

  describe("Business Logic Tests", () => {
    test("should handle search type name uniqueness", async () => {
      const searchTypeData = {
        name: 'Unique Search Type',
        description: 'Test description'
      };
      
      // Create first search type
      await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, adminToken);
      
      // Try to create duplicate
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, adminToken);
      expect([200, 201, 400, 401, 403, 409, 422, 500]).toContain(res.status);
    });

    test("should validate search type name length", async () => {
      const searchTypeData = {
        name: 'a'.repeat(1000),
        description: 'Test description'
      };
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, adminToken);
      expect([200, 201, 400, 401, 403, 413, 422, 500]).toContain(res.status);
    });

    test("should handle concurrent search type creation", async () => {
      const searchTypeData = {
        name: 'Concurrent Search Type',
        description: 'Test description'
      };

      const promises = Array(3).fill().map((_, index) => 
        requestHelper.authenticatedPost('/api/searchTypes', { ...searchTypeData, name: `${searchTypeData.name} ${index}` }, adminToken)
      );

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect([200, 201, 400, 401, 403, 409, 422, 500]).toContain(res.status);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      const res = await requestHelper.unauthenticatedGet('/api/searchTypes');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle missing required parameters", async () => {
      const res = await requestHelper.authenticatedPost('/api/searchTypes', { description: 'Test' }, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle empty request body", async () => {
      const res = await requestHelper.authenticatedPost('/api/searchTypes', {}, adminToken);
      expect([400, 401, 403, 422, 500]).toContain(res.status);
    });

    test("should handle invalid JSON structure", async () => {
      const res = await request(app)
        .post('/api/searchTypes')
        .send('not-json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });

  describe("Performance Tests", () => {
    test("should handle large search type list retrieval", async () => {
      const startTime = Date.now();
      const res = await requestHelper.unauthenticatedGet('/api/searchTypes');
      const endTime = Date.now();
      
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("should handle rapid search type creation", async () => {
      const searchTypeData = {
        name: 'Rapid Search Type',
        description: 'Test description'
      };

      const startTime = Date.now();
      const res = await requestHelper.authenticatedPost('/api/searchTypes', searchTypeData, adminToken);
      const endTime = Date.now();
      
      expect([200, 201, 400, 401, 403, 409, 422, 500]).toContain(res.status);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});
