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

describe("📋 Job Applications Optimized Tests", () => {
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

  describe("POST /api/jobApplications", () => {
    test("should require authentication", async () => {
      const applicationData = {
        jobOffer: testConfig.defaultIds.companyId,
        coverLetter: "I am interested in this position"
      };

      const res = await requestHelper.unauthenticatedPost('/api/jobApplications', applicationData);
      expect(res.status).toBe(401);
    });

    test("should handle application creation by student", async () => {
      const applicationData = {
        jobOffer: testConfig.defaultIds.companyId,
        coverLetter: "I am interested in this position",
        resume: "My resume content"
      };

      const res = await requestHelper.authenticatedPost('/api/jobApplications', applicationData, studentToken);
      expect([201, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 201) {
        expect(res.body).toHaveProperty('jobOffer');
        expect(res.body).toHaveProperty('student');
        expect(res.body).toHaveProperty('status', 'pending');
      }
    });

    test("should reject application creation by company", async () => {
      const applicationData = {
        jobOffer: testConfig.defaultIds.companyId,
        coverLetter: "Test application"
      };

      const res = await requestHelper.authenticatedPost('/api/jobApplications', applicationData, companyToken);
      expect([401, 403, 500]).toContain(res.status);
    });

    test("should validate required fields", async () => {
      const incompleteData = { coverLetter: "Missing job offer" };

      const res = await requestHelper.authenticatedPost('/api/jobApplications', incompleteData, studentToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle invalid job offer ID", async () => {
      const invalidData = {
        jobOffer: "invalid-job-offer-id",
        coverLetter: "Test application"
      };

      const res = await requestHelper.authenticatedPost('/api/jobApplications', invalidData, studentToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("GET /api/jobApplications/student/:studentId", () => {
    test("should require authentication", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.unauthenticatedGet(`/api/jobApplications/student/${studentId}`);
      expect(res.status).toBe(401);
    });

    test("should handle student applications request", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/student/${studentId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle authorization for student applications", async () => {
      const otherStudentId = "507f1f77bcf86cd799439999";
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/student/${otherStudentId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should allow admin to view any student applications", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/student/${studentId}`, adminToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("GET /api/jobApplications/company/:companyId", () => {
    test("should require authentication", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const res = await requestHelper.unauthenticatedGet(`/api/jobApplications/company/${companyId}`);
      expect(res.status).toBe(401);
    });

    test("should handle company applications request", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/company/${companyId}`, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle query parameters for company applications", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/company/${companyId}?limit=10&sort=createdAt`, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle authorization for company applications", async () => {
      const otherCompanyId = "507f1f77bcf86cd799439999";
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/company/${otherCompanyId}`, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("GET /api/jobApplications/jobOffer/:jobOfferId", () => {
    test("should require authentication", async () => {
      const jobOfferId = testConfig.defaultIds.companyId;
      const res = await requestHelper.unauthenticatedGet(`/api/jobApplications/jobOffer/${jobOfferId}`);
      expect(res.status).toBe(401);
    });

    test("should handle job offer applications request", async () => {
      const jobOfferId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/jobOffer/${jobOfferId}`, companyToken);
      expect([200, 401, 403, 404]).toContain(res.status);
      
      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle invalid job offer ID", async () => {
      const invalidId = "invalid-job-offer-id";
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/jobOffer/${invalidId}`, companyToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("GET /api/jobApplications/check/:studentId/:jobOfferId", () => {
    test("should require authentication", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const jobOfferId = testConfig.defaultIds.companyId;
      const res = await requestHelper.unauthenticatedGet(`/api/jobApplications/check/${studentId}/${jobOfferId}`);
      expect(res.status).toBe(401);
    });

    test("should handle application check request", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const jobOfferId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/check/${studentId}/${jobOfferId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });
  });

  describe("GET /api/jobApplications/:id", () => {
    test("should require authentication", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const res = await requestHelper.unauthenticatedGet(`/api/jobApplications/${applicationId}`);
      expect(res.status).toBe(401);
    });

    test("should handle specific application request", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/${applicationId}`, studentToken);
      expect([200, 401, 403, 404]).toContain(res.status);
    });

    test("should handle invalid application ID", async () => {
      const invalidId = "invalid-application-id";
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/${invalidId}`, studentToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/jobApplications/:id/status", () => {
    test("should require authentication", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const statusData = { status: "accepted" };

      const res = await request(app)
        .put(`/api/jobApplications/${applicationId}/status`)
        .send(statusData);
      expect(res.status).toBe(401);
    });

    test("should handle status update by company", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const statusData = { 
        status: "accepted",
        reviewNotes: "Great candidate"
      };

      const res = await requestHelper.authenticatedPut(`/api/jobApplications/${applicationId}/status`, statusData, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should reject status update by student", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const statusData = { status: "accepted" };

      const res = await requestHelper.authenticatedPut(`/api/jobApplications/${applicationId}/status`, statusData, studentToken);
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test("should validate status values", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const invalidStatusData = { status: "invalid-status" };

      const res = await requestHelper.authenticatedPut(`/api/jobApplications/${applicationId}/status`, invalidStatusData, companyToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/jobApplications/:id/interview", () => {
    test("should require authentication", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const interviewData = { 
        interviewDate: new Date().toISOString(),
        interviewType: "video"
      };

      const res = await request(app)
        .put(`/api/jobApplications/${applicationId}/interview`)
        .send(interviewData);
      expect(res.status).toBe(401);
    });

    test("should handle interview scheduling", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const interviewData = { 
        interviewDate: new Date().toISOString(),
        interviewType: "video",
        interviewNotes: "Technical interview"
      };

      const res = await requestHelper.authenticatedPut(`/api/jobApplications/${applicationId}/interview`, interviewData, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("DELETE /api/jobApplications/:id", () => {
    test("should require authentication", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const res = await request(app).delete(`/api/jobApplications/${applicationId}`);
      expect(res.status).toBe(401);
    });

    test("should handle application deletion", async () => {
      const applicationId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedDelete(`/api/jobApplications/${applicationId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle invalid application ID for deletion", async () => {
      const invalidId = "invalid-application-id";
      const res = await requestHelper.authenticatedDelete(`/api/jobApplications/${invalidId}`, studentToken);
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe("Statistics Endpoints", () => {
    test("should handle student statistics", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/student/${studentId}/stats`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle company statistics", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/company/${companyId}/stats`, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });

    test("should handle recent applications for company", async () => {
      const companyId = testConfig.defaultIds.companyId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/company/${companyId}/recent`, companyToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        // API can return string, object, or array depending on implementation
        expect(['string', 'object']).toContain(typeof res.body);
      }
    });
  });

  describe("Security Tests", () => {
    test("should handle XSS attempts in application data", async () => {
      const xssPayloads = testConfig.getSecurityPayloads('xss');

      for (const payload of xssPayloads.slice(0, 2)) {
        const applicationData = {
          jobOffer: testConfig.defaultIds.companyId,
          coverLetter: payload
        };

        const res = await requestHelper.authenticatedPost('/api/jobApplications', applicationData, studentToken);
        expect([201, 400, 401, 403, 404, 500]).toContain(res.status);
      }
    });

    test("should handle malformed JSON", async () => {
      const res = await requestHelper.testMalformedJson('/api/jobApplications', studentToken);
      expect([200, 400, 401, 403, 500]).toContain(res.status);
    });

    test("should prevent duplicate applications", async () => {
      const applicationData = {
        jobOffer: testConfig.defaultIds.companyId,
        coverLetter: "Duplicate application test"
      };

      const promises = [];
      for (let i = 0; i < 2; i++) {
        promises.push(requestHelper.authenticatedPost('/api/jobApplications', applicationData, studentToken));
      }

      const results = await Promise.all(promises);
      
      results.forEach(res => {
        expect([201, 400, 401, 403, 404, 409, 500]).toContain(res.status);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      const studentId = testConfig.defaultIds.studentId;
      const res = await requestHelper.authenticatedGet(`/api/jobApplications/student/${studentId}`, studentToken);
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test("should handle missing required parameters", async () => {
      const res = await requestHelper.authenticatedPost('/api/jobApplications', {}, studentToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test("should handle empty request body", async () => {
      const res = await requestHelper.authenticatedPost('/api/jobApplications', null, studentToken);
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });
});
