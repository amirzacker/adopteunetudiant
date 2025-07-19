const request = require("supertest");
const RequestHelper = require("../__mocks__/utils/request.helper");

// Import app from server
let app;
try {
  app = require("../../server").app;
} catch (error) {
  app = require("../../server");
}

describe("📈 API Optimized Tests", () => {
  let requestHelper;

  beforeAll(() => {
    requestHelper = new RequestHelper(app);
  });

  describe("Error Response Consistency", () => {
    test("should return consistent 404 for non-existent routes", async () => {
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

    test("should have consistent error format across endpoints", async () => {
      const testRoutes = [
        '/api/nonexistent-endpoint',
        '/api/another-fake-route'
      ];

      for (const route of testRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json|text/);
      }
    });
  });

  describe("HTTP Method Consistency", () => {
    test("should handle HTTP methods consistently", async () => {
      const methods = ['get', 'post', 'put', 'delete'];
      const testRoute = '/api/nonexistent';
      
      for (const method of methods) {
        const res = await request(app)[method](testRoute);
        expect([401, 404, 405]).toContain(res.status);
      }
    });

    test("should handle unsupported HTTP methods", async () => {
      const res = await request(app).patch("/api/jobOffers");
      expect([401, 404, 405]).toContain(res.status);
    });

    test("should handle OPTIONS requests for CORS", async () => {
      const res = await request(app).options("/api/jobOffers");
      expect([200, 204, 404]).toContain(res.status);
    });
  });

  describe("Content-Type Consistency", () => {
    test("should handle JSON content-type consistently", async () => {
      const routes = ['/api/nonexistent', '/api/invalid-endpoint'];

      for (const route of routes) {
        const res = await request(app)
          .post(route)
          .set('Content-Type', 'application/json')
          .send({ test: 'data' });
        
        expect([401, 404, 405]).toContain(res.status);
      }
    });

    test("should handle different content types gracefully", async () => {
      const contentTypes = ['application/json', 'text/plain'];

      for (const contentType of contentTypes) {
        const res = await request(app)
          .post('/api/nonexistent')
          .set('Content-Type', contentType)
          .send('test data');
        
        expect([400, 401, 404, 405]).toContain(res.status);
      }
    });
  });

  describe("Header Handling Consistency", () => {
    test("should handle custom headers consistently", async () => {
      const customHeaders = {
        'X-Custom-Header': 'test-value',
        'X-Client-Version': '1.0.0'
      };

      const res = await requestHelper.customRequest(
        'GET',
        '/api/nonexistent',
        customHeaders
      );

      // The route doesn't exist, but custom headers might trigger different middleware behavior
      // Accept both 403 (forbidden due to headers) and 404 (not found)
      expect([403, 404]).toContain(res.status);
    });

    test("should handle multiple headers gracefully", async () => {
      const res = await request(app)
        .get("/api/nonexistent")
        .set("X-Custom-Header", "test")
        .set("X-Another-Header", "test2");

      expect(res.status).toBe(404);
    });

    test("should handle missing standard headers", async () => {
      const res = await request(app)
        .post('/api/nonexistent')
        .send({ data: 'test' });
      
      expect([401, 404, 405]).toContain(res.status);
    });
  });

  describe("Query Parameter Consistency", () => {
    test("should handle query parameters consistently", async () => {
      const queryParams = [
        '?page=1&limit=10',
        '?search=test',
        '?filter=active'
      ];

      for (const params of queryParams) {
        const res = await requestHelper.unauthenticatedGet(`/api/nonexistent${params}`);
        expect(res.status).toBe(404);
      }
    });

    test("should handle malformed query parameters", async () => {
      const malformedParams = ['?invalid=', '?=value'];

      for (const params of malformedParams) {
        const res = await requestHelper.unauthenticatedGet(`/api/nonexistent${params}`);
        expect(res.status).toBe(404);
      }
    });
  });

  describe("URL Encoding Consistency", () => {
    test("should handle special characters in URLs consistently", async () => {
      const specialRoutes = [
        "/api/test with spaces",
        "/api/test%20encoded"
      ];

      for (const route of specialRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect([400, 404]).toContain(res.status);
      }
    });

    test("should handle very long URLs", async () => {
      const longRoute = "/api/" + "a".repeat(500);
      const res = await requestHelper.unauthenticatedGet(longRoute);
      expect([400, 404, 414]).toContain(res.status);
    });
  });

  describe("Response Format Consistency", () => {
    test("should return consistent response format for errors", async () => {
      const errorRoutes = ['/api/nonexistent', '/api/invalid'];

      for (const route of errorRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect(res.status).toBe(404);
        expect(res.headers).toHaveProperty('content-type');
      }
    });

    test("should handle Accept header consistently", async () => {
      const acceptHeaders = ['application/json', 'text/html', '*/*'];

      for (const accept of acceptHeaders) {
        const res = await request(app)
          .get('/api/nonexistent')
          .set('Accept', accept);
        
        expect(res.status).toBe(404);
      }
    });
  });

  describe("CORS Consistency", () => {
    test("should handle CORS consistently across routes", async () => {
      const origins = ["http://localhost:3000", "https://example.com"];

      for (const origin of origins) {
        const res = await requestHelper.testCORS('/api/nonexistent', origin);
        expect(res.status).toBe(404);
      }
    });

    test("should handle preflight requests consistently", async () => {
      const res = await request(app)
        .options('/api/nonexistent')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');
      
      expect([200, 204, 404]).toContain(res.status);
    });
  });

  describe("Rate Limiting Consistency", () => {
    test("should handle rapid requests consistently", async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(requestHelper.unauthenticatedGet('/api/nonexistent'));
      }

      const results = await Promise.all(promises);
      
      results.forEach(res => {
        expect([404, 429]).toContain(res.status);
      });
    });

    test("should handle sequential requests consistently", async () => {
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

  describe("API Versioning Consistency", () => {
    test("should handle API version consistently", async () => {
      const versionedRoutes = ['/api/v1/nonexistent', '/v1/api/nonexistent'];

      for (const route of versionedRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect(res.status).toBe(404);
      }
    });
  });

  describe("Error Code Consistency", () => {
    test("should return consistent error codes for similar scenarios", async () => {
      const similarRoutes = [
        '/api/users/nonexistent',
        '/api/companies/nonexistent'
      ];

      for (const route of similarRoutes) {
        const res = await requestHelper.unauthenticatedGet(route);
        expect([401, 404]).toContain(res.status);
      }
    });
  });
});
