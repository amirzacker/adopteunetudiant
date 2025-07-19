const JobApplication = require("./jobApplications.model");

class JobApplicationService {

  // Get all applications for a student
  async getByStudent(studentId) {
    return JobApplication.find({ student: studentId })
      .sort({ applicationDate: -1 })
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'company',
          select: 'name city profilePicture'
        }
      });
  }

  // Get all applications for a specific job offer
  async getByJobOffer(jobOfferId) {
    return JobApplication.find({ jobOffer: jobOfferId })
      .sort({ applicationDate: -1 })
      .populate('student', 'firstname lastname email profilePicture cv motivationLetter domain searchType');
  }

  // Get all applications for a company's job offers
  async getByCompany(companyId, options = {}) {
    const { limit, sort } = options;

    let applications = await JobApplication.find()
      .populate({
        path: 'jobOffer',
        match: { company: companyId },
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .populate('student', 'firstname lastname email profilePicture cv motivationLetter domain searchType');

    // Filter out applications where jobOffer is null (not matching company)
    applications = applications.filter(app => app.jobOffer !== null);

    // Apply sorting
    if (sort === 'recent') {
      applications = applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
    } else {
      applications = applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
    }

    // Apply limit
    if (limit) {
      applications = applications.slice(0, parseInt(limit));
    }

    return applications;
  }

  // Get application by ID
  async getById(id) {
    return JobApplication.findById(id)
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'company',
          select: 'name city profilePicture'
        }
      })
      .populate('student', 'firstname lastname email profilePicture cv motivationLetter domain searchType');
  }

  // Create new job application
  async create(data) {
    const application = new JobApplication(data);
    return application.save();
  }

  // Update application status
  async updateStatus(id, status, reviewNotes = null) {
    const updateData = { 
      status, 
      reviewDate: new Date() 
    };
    
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }

    return JobApplication.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'company',
          select: 'name city profilePicture'
        }
      })
      .populate('student', 'firstname lastname email profilePicture');
  }

  // Schedule interview
  async scheduleInterview(id, interviewDate, interviewNotes = null) {
    const updateData = {
      interviewDate,
      status: 'reviewed'
    };

    if (interviewNotes) {
      updateData.interviewNotes = interviewNotes;
    }

    return JobApplication.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete application
  async delete(id) {
    return JobApplication.findByIdAndDelete(id);
  }

  // Check if student has already applied to a job offer
  async hasApplied(studentId, jobOfferId) {
    const application = await JobApplication.findOne({
      student: studentId,
      jobOffer: jobOfferId
    });
    return !!application;
  }

  // Get application statistics for a student
  async getStudentStats(studentId) {
    const stats = await JobApplication.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // Get application statistics for a company
  async getCompanyStats(companyId) {
    const JobOffer = require('../jobOffers/jobOffers.model');
    
    // Get all job offers for the company
    const companyJobOffers = await JobOffer.find({ company: companyId }).select('_id');
    const jobOfferIds = companyJobOffers.map(job => job._id);

    const stats = await JobApplication.aggregate([
      { $match: { jobOffer: { $in: jobOfferIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // Get recent applications for a company (for dashboard)
  async getRecentApplications(companyId, limit = 5) {
    const JobOffer = require('../jobOffers/jobOffers.model');
    
    // Get all job offers for the company
    const companyJobOffers = await JobOffer.find({ company: companyId }).select('_id');
    const jobOfferIds = companyJobOffers.map(job => job._id);

    return JobApplication.find({ jobOffer: { $in: jobOfferIds } })
      .sort({ applicationDate: -1 })
      .limit(limit)
      .populate({
        path: 'jobOffer',
        select: 'title'
      })
      .populate('student', 'firstname lastname profilePicture');
  }

  // Get applications with filters
  async getWithFilters(filters = {}) {
    const query = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.jobOffer) query.jobOffer = filters.jobOffer;
    if (filters.student) query.student = filters.student;
    if (filters.dateFrom) {
      query.applicationDate = { $gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      query.applicationDate = { 
        ...query.applicationDate, 
        $lte: new Date(filters.dateTo) 
      };
    }

    return JobApplication.find(query)
      .sort({ applicationDate: -1 })
      .populate({
        path: 'jobOffer',
        populate: {
          path: 'company',
          select: 'name city profilePicture'
        }
      })
      .populate('student', 'firstname lastname email profilePicture cv motivationLetter domain searchType');
  }
}

module.exports = new JobApplicationService();
