const { NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } = require('../../utils/errors/');
const jobOffersService = require("./jobOffers.service");
const logger = require('../../utils/logger');
const LogMetadata = require('../../utils/logMetadata');
const PerformanceTracker = require('../../utils/performance');

class JobOffersController {

  // Get all published job offers with optional filtering
  async getAll(req, res, next) {
    try {
      const filters = {
        domain: req.query.domain,
        jobType: req.query.jobType,
        location: req.query.location,
        searchType: req.query.searchType,
        search: req.query.search
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const jobOffers = await jobOffersService.getAll(filters);
      res.json(jobOffers);
    } catch (err) {
      next(err);
    }
  }

  // Get job offer by ID
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const jobOffer = await jobOffersService.getById(id);
      
      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }
      
      res.json(jobOffer);
    } catch (err) {
      next(err);
    }
  }

  // Get job offers by company
  async getByCompany(req, res, next) {
    try {
      const companyId = req.params.companyId;
      const includeAll = req.query.includeAll === 'true';
      const limit = req.query.limit;
      const sort = req.query.sort;

      // Check if user is the company owner or admin
      if (req.user._id.toString() !== companyId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own job offers");
      }

      const options = { includeAll, limit, sort };
      const jobOffers = await jobOffersService.getByCompany(companyId, options);
      res.json(jobOffers);
    } catch (err) {
      next(err);
    }
  }

  // Create new job offer
  async create(req, res, next) {
    try {
      logger.info('Job offer creation initiated',
        LogMetadata.createBusinessContext('JOB_OFFER_CREATE_ATTEMPT', {
          companyId: req.user._id,
          title: req.body.title,
          jobType: req.body.jobType,
          location: req.body.location
        }, req)
      );

      // Check if user is a company
      if (!req.user.isCompany) {
        logger.warn('Job offer creation denied: User is not a company',
          LogMetadata.createAuthContext('JOB_OFFER_CREATE_DENIED', req, {
            userId: req.user._id,
            userType: req.user.isStudent ? 'student' : 'admin',
            attemptedAction: 'create_job_offer'
          })
        );
        throw new ForbiddenError("Only companies can create job offers");
      }

      // Set the company to the current user
      const jobOfferData = {
        ...req.body,
        company: req.user._id.toString()
      };

      const jobOffer = await PerformanceTracker.measureApiOperation(
        req,
        () => jobOffersService.create(jobOfferData),
        'CREATE_JOB_OFFER'
      );

      logger.info('Job offer created successfully',
        LogMetadata.createBusinessContext('JOB_OFFER_CREATED', {
          jobOfferId: jobOffer._id,
          companyId: req.user._id,
          title: jobOffer.title,
          jobType: jobOffer.jobType,
          location: jobOffer.location,
          status: jobOffer.status
        }, req)
      );

      req.io.emit("jobOffer:create", jobOffer);
      res.status(201).json(jobOffer);
    } catch (err) {
      logger.error('Error creating job offer',
        LogMetadata.createErrorContext(err, req, {
          operation: 'create',
          companyId: req.user ? req.user._id : null,
          title: req.body.title
        })
      );
      next(err);
    }
  }

  // Update job offer
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const jobOffer = await jobOffersService.getById(id);

      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }

      // Check if user is the company owner or admin
      if (jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only update your own job offers");
      }

      const updatedJobOffer = await jobOffersService.update(id, req.body);
      req.io.emit("jobOffer:update", updatedJobOffer);
      res.json(updatedJobOffer);
    } catch (err) {
      next(err);
    }
  }

  // Delete job offer
  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const jobOffer = await jobOffersService.getById(id);

      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }

      // Check if user is the company owner or admin
      if (jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only delete your own job offers");
      }

      await jobOffersService.delete(id);
      req.io.emit("jobOffer:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Publish job offer
  async publish(req, res, next) {
    try {
      const id = req.params.id;
      const jobOffer = await jobOffersService.getById(id);

      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }

      // Check if user is the company owner or admin
      if (jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only publish your own job offers");
      }

      const publishedJobOffer = await jobOffersService.publish(id);
      req.io.emit("jobOffer:publish", publishedJobOffer);
      res.json(publishedJobOffer);
    } catch (err) {
      next(err);
    }
  }

  // Close job offer
  async close(req, res, next) {
    try {
      const id = req.params.id;
      const jobOffer = await jobOffersService.getById(id);

      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }

      // Check if user is the company owner or admin
      if (jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only close your own job offers");
      }

      const closedJobOffer = await jobOffersService.close(id);
      req.io.emit("jobOffer:close", closedJobOffer);
      res.json(closedJobOffer);
    } catch (err) {
      next(err);
    }
  }

  // Get company statistics
  async getCompanyStats(req, res, next) {
    try {
      const companyId = req.params.companyId;

      // Check if user is the company owner or admin
      if (req.user._id.toString() !== companyId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own statistics");
      }

      const stats = await jobOffersService.getCompanyStats(companyId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  // Get recommended jobs for a student
  async getRecommendedJobs(req, res, next) {
    try {
      const studentId = req.params.studentId;
      const limit = parseInt(req.query.limit) || 10;

      // Check if user is the student or admin
      if (req.user._id.toString() !== studentId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own recommendations");
      }

      const recommendedJobs = await jobOffersService.getRecommendedJobs(studentId, limit);
      res.json(recommendedJobs);
    } catch (err) {
      next(err);
    }
  }

  // Advanced search
  async search(req, res, next) {
    try {
      const searchParams = {
        query: req.query.q,
        domain: req.query.domain,
        jobType: req.query.jobType,
        location: req.query.location,
        searchType: req.query.searchType,
        salaryMin: req.query.salaryMin,
        salaryMax: req.query.salaryMax,
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };

      const results = await jobOffersService.search(searchParams);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobOffersController();
