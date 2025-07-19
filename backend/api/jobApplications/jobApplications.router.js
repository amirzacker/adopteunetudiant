const express = require("express");
const authMiddleware = require("../../middlewares/auth");
const jobApplicationsController = require("./jobApplications.controller");
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Student-specific routes
router.get("/student/:studentId", jobApplicationsController.getByStudent);
router.get("/student/:studentId/stats", jobApplicationsController.getStudentStats);
router.get("/check/:studentId/:jobOfferId", jobApplicationsController.checkApplication);

// Company-specific routes
router.get("/company/:companyId", jobApplicationsController.getByCompany);
router.get("/company/:companyId/stats", jobApplicationsController.getCompanyStats);
router.get("/company/:companyId/recent", jobApplicationsController.getRecentApplications);

// Job offer-specific routes
router.get("/jobOffer/:jobOfferId", jobApplicationsController.getByJobOffer);

// CRUD operations
router.get("/:id", jobApplicationsController.getById);
router.post("/", jobApplicationsController.create);
router.delete("/:id", jobApplicationsController.delete);

// Status management
router.put("/:id/status", jobApplicationsController.updateStatus);
router.put("/:id/interview", jobApplicationsController.scheduleInterview);

module.exports = router;
