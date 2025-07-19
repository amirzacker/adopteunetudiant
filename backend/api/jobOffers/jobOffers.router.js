const express = require("express");
const authMiddleware = require("../../middlewares/auth");
const jobOffersController = require("./jobOffers.controller");
const router = express.Router();

// Public routes (no authentication required)
router.get("/", jobOffersController.getAll);
router.get("/search", jobOffersController.search);
router.get("/:id", jobOffersController.getById);

// Protected routes (authentication required)
router.use(authMiddleware);

// Company-specific routes
router.get("/company/:companyId", jobOffersController.getByCompany);
router.get("/company/:companyId/stats", jobOffersController.getCompanyStats);

// Student-specific routes
router.get("/student/:studentId/recommended", jobOffersController.getRecommendedJobs);

// CRUD operations
router.post("/", jobOffersController.create);
router.put("/:id", jobOffersController.update);
router.delete("/:id", jobOffersController.delete);

// Status management
router.put("/:id/publish", jobOffersController.publish);
router.put("/:id/close", jobOffersController.close);

module.exports = router;
