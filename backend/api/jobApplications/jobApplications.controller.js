const { NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } = require('../../utils/errors/');
const jobApplicationsService = require("./jobApplications.service");
const jobOffersService = require("../jobOffers/jobOffers.service");
const logger = require('../../utils/logger');
const LogMetadata = require('../../utils/logMetadata');
const PerformanceTracker = require('../../utils/performance');

class JobApplicationsController {

  // Get applications by student
  async getByStudent(req, res, next) {
    try {
      const studentId = req.params.studentId;

      // Check if user is the student or admin
      if (req.user._id.toString() !== studentId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own applications");
      }

      const applications = await jobApplicationsService.getByStudent(studentId);
      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  // Get applications by job offer
  async getByJobOffer(req, res, next) {
    try {
      const jobOfferId = req.params.jobOfferId;
      
      // Check if the job offer belongs to the current user (company)
      const jobOffer = await jobOffersService.getById(jobOfferId);
      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }

      if (jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view applications for your own job offers");
      }

      const applications = await jobApplicationsService.getByJobOffer(jobOfferId);
      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  // Get applications by company
  async getByCompany(req, res, next) {
    try {
      const companyId = req.params.companyId;
      const limit = req.query.limit;
      const sort = req.query.sort;

      // Check if user is the company or admin
      if (req.user._id.toString() !== companyId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view applications for your own company");
      }

      const options = { limit, sort };
      const applications = await jobApplicationsService.getByCompany(companyId, options);
      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  // Get application by ID
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const application = await jobApplicationsService.getById(id);

      if (!application) {
        throw new NotFoundError("Application not found");
      }

      // Check if user is the student who applied, the company that owns the job, or admin
      const isStudent = application.student._id.toString() === req.user._id.toString();
      const isCompany = application.jobOffer.company._id.toString() === req.user._id.toString();
      
      if (!isStudent && !isCompany && !req.user.isAdmin) {
        throw new ForbiddenError("You don't have permission to view this application");
      }

      res.json(application);
    } catch (err) {
      next(err);
    }
  }

  // Create new job application
  async create(req, res, next) {
    try {
      // Check if user is a student
      if (!req.user.isStudent) {
        throw new ForbiddenError("Only students can apply to job offers");
      }

      // Check if job offer exists and is published
      const jobOffer = await jobOffersService.getById(req.body.jobOffer);
      if (!jobOffer) {
        throw new NotFoundError("Job offer not found");
      }

      if (jobOffer.status !== 'published') {
        throw new ValidationError("You can only apply to published job offers");
      }

      // Check if student has already applied
      const hasApplied = await jobApplicationsService.hasApplied(req.user._id.toString(), req.body.jobOffer);
      if (hasApplied) {
        throw new ValidationError("You have already applied to this job offer");
      }

      // Set the student to the current user
      const applicationData = {
        ...req.body,
        student: req.user._id.toString()
      };

      const application = await jobApplicationsService.create(applicationData);
      req.io.emit("jobApplication:create", application);
      res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  }

  // Update application status
  async updateStatus(req, res, next) {
    try {
      const id = req.params.id;
      const { status, reviewNotes } = req.body;

      logger.info('Job application status update initiated',
        LogMetadata.createBusinessContext('JOB_APPLICATION_STATUS_UPDATE_ATTEMPT', {
          applicationId: id,
          newStatus: status,
          hasReviewNotes: !!reviewNotes,
          companyId: req.user._id
        }, req)
      );

      const application = await PerformanceTracker.measureDbQuery(
        'findById', 'jobApplications',
        () => jobApplicationsService.getById(id),
        { applicationId: id }
      );

      if (!application) {
        logger.warn('Job application status update failed: Application not found',
          LogMetadata.createBusinessContext('JOB_APPLICATION_NOT_FOUND', {
            applicationId: id,
            companyId: req.user._id
          }, req)
        );
        throw new NotFoundError("Application not found");
      }

      // Check if user is the company that owns the job offer or admin
      if (application.jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        logger.warn('Job application status update denied: Insufficient permissions',
          LogMetadata.createAuthContext('JOB_APPLICATION_UPDATE_DENIED', req, {
            applicationId: id,
            applicationCompanyId: application.jobOffer.company._id,
            requestingUserId: req.user._id,
            isAdmin: req.user.isAdmin
          })
        );
        throw new ForbiddenError("You can only update applications for your own job offers");
      }

      const updatedApplication = await PerformanceTracker.measureApiOperation(
        req,
        () => jobApplicationsService.updateStatus(id, status, reviewNotes),
        'UPDATE_APPLICATION_STATUS'
      );

      logger.info('Job application status updated successfully',
        LogMetadata.createBusinessContext('JOB_APPLICATION_STATUS_UPDATED', {
          applicationId: id,
          studentId: updatedApplication.student._id,
          jobOfferId: updatedApplication.jobOffer._id,
          oldStatus: application.status,
          newStatus: status,
          companyId: req.user._id,
          hasReviewNotes: !!reviewNotes
        }, req)
      );

      req.io.emit("jobApplication:statusUpdate", updatedApplication);
      res.json(updatedApplication);
    } catch (err) {
      logger.error('Error updating job application status',
        LogMetadata.createErrorContext(err, req, {
          operation: 'updateStatus',
          applicationId: id,
          newStatus: status
        })
      );
      next(err);
    }
  }

  // Schedule interview
  async scheduleInterview(req, res, next) {
    try {
      const id = req.params.id;
      const { interviewDate, interviewNotes } = req.body;

      const application = await jobApplicationsService.getById(id);
      if (!application) {
        throw new NotFoundError("Application not found");
      }

      // Check if user is the company that owns the job offer or admin
      if (application.jobOffer.company._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only schedule interviews for your own job offers");
      }

      const updatedApplication = await jobApplicationsService.scheduleInterview(id, interviewDate, interviewNotes);
      req.io.emit("jobApplication:interviewScheduled", updatedApplication);
      res.json(updatedApplication);
    } catch (err) {
      next(err);
    }
  }

  // Delete application
  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const application = await jobApplicationsService.getById(id);

      if (!application) {
        throw new NotFoundError("Application not found");
      }

      // Check if user is the student who applied or admin
      if (application.student._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        throw new ForbiddenError("You can only delete your own applications");
      }

      await jobApplicationsService.delete(id);
      req.io.emit("jobApplication:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Get student statistics
  async getStudentStats(req, res, next) {
    try {
      const studentId = req.params.studentId;

      // Check if user is the student or admin
      if (req.user._id.toString() !== studentId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own statistics");
      }

      const stats = await jobApplicationsService.getStudentStats(studentId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  // Get company statistics
  async getCompanyStats(req, res, next) {
    try {
      const companyId = req.params.companyId;

      // Check if user is the company or admin
      if (req.user._id.toString() !== companyId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own statistics");
      }

      const stats = await jobApplicationsService.getCompanyStats(companyId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  // Get recent applications for company dashboard
  async getRecentApplications(req, res, next) {
    try {
      const companyId = req.params.companyId;
      const limit = parseInt(req.query.limit) || 5;

      // Check if user is the company or admin
      if (req.user.id !== companyId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only view your own applications");
      }

      const applications = await jobApplicationsService.getRecentApplications(companyId, limit);
      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  // Check if student has applied to a job offer
  async checkApplication(req, res, next) {
    try {
      const { studentId, jobOfferId } = req.params;

      // Check if user is the student or admin
      if (req.user._id.toString() !== studentId && !req.user.isAdmin) {
        throw new ForbiddenError("You can only check your own applications");
      }

      const hasApplied = await jobApplicationsService.hasApplied(studentId, jobOfferId);
      res.json({ hasApplied });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobApplicationsController();
