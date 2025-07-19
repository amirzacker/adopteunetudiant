const JobOffer = require("./jobOffers.model");

class JobOfferService {
  
  // Get all published job offers with optional filtering
  async getAll(filters = {}) {
    const query = { status: "published" };
    
    // Add filters
    if (filters.domain) query.domain = filters.domain;
    if (filters.jobType) query.jobType = filters.jobType;
    if (filters.location) query.location = new RegExp(filters.location, 'i');

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    const sort = filters.search ? { score: { $meta: "textScore" } } : { publicationDate: -1 };
    
    return JobOffer.find(query)
      .sort(sort)
      .populate('company', 'name email city profilePicture')
      .populate('domain')
      .populate('jobType');
  }

  // Get job offer by ID
  async getById(id) {
    return JobOffer.findById(id)
      .populate('company', 'name email city profilePicture desc')
      .populate('domain')
      .populate('searchType');
  }

  // Get job offers by company
  async getByCompany(companyId, options = {}) {
    const { includeAll = false, limit, sort } = options;
    const query = { company: companyId };
    if (!includeAll) {
      query.status = { $in: ["published", "closed"] };
    }

    let queryBuilder = JobOffer.find(query);

    // Apply sorting
    if (sort === 'recent') {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    // Apply limit
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }

    return queryBuilder
      .populate('domain')
      .populate('jobType');
  }

  // Create new job offer
  async create(data) {
    const jobOffer = new JobOffer(data);
    return jobOffer.save();
  }

  // Update job offer
  async update(id, data) {
    return JobOffer.findByIdAndUpdate(id, data, { new: true })
      .populate('company', 'name email city profilePicture')
      .populate('domain')
      .populate('searchType');
  }

  // Delete job offer
  async delete(id) {
    return JobOffer.findByIdAndDelete(id);
  }

  // Publish job offer
  async publish(id) {
    return JobOffer.findByIdAndUpdate(
      id, 
      { status: "published", publicationDate: new Date() }, 
      { new: true }
    );
  }

  // Close job offer
  async close(id) {
    return JobOffer.findByIdAndUpdate(id, { status: "closed" }, { new: true });
  }

  // Get job offers statistics for a company
  async getCompanyStats(companyId) {
    const JobApplication = require('../jobApplications/jobApplications.model');

    // Get job offers stats
    const stats = await JobOffer.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total applications for this company's job offers
    const totalApplications = await JobApplication.countDocuments({
      jobOffer: {
        $in: await JobOffer.find({ company: companyId }).distinct('_id')
      }
    });

    const result = {
      total: 0,
      published: 0,
      draft: 0,
      closed: 0,
      totalApplications: totalApplications
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // Get recommended jobs for a student based on their profile
  async getRecommendedJobs(studentId, limit = 10) {
    const User = require('../users/users.model');
    const student = await User.findById(studentId);
    
    if (!student) return [];

    const query = {
      status: "published",
      $or: []
    };

    // Match by domain
    if (student.domain) {
      query.$or.push({ domain: student.domain });
    }

    // Match by search type
    if (student.searchType) {
      query.$or.push({ searchType: student.searchType });
    }

    // If no specific criteria, return recent jobs
    if (query.$or.length === 0) {
      delete query.$or;
    }

    return JobOffer.find(query)
      .sort({ publicationDate: -1 })
      .limit(limit)
      .populate('company', 'name city profilePicture')
      .populate('domain')
      .populate('searchType');
  }

  // Search job offers with advanced filters
  async search(searchParams) {
    const {
      query,
      domain,
      jobType,
      location,

      salaryMin,
      salaryMax,
      page = 1,
      limit = 10
    } = searchParams;

    const filter = { status: "published" };
    
    if (query) {
      filter.$text = { $search: query };
    }
    
    if (domain) filter.domain = domain;
    if (jobType) filter.jobType = jobType;

    if (location) filter.location = new RegExp(location, 'i');

    const sort = query ? { score: { $meta: "textScore" } } : { publicationDate: -1 };
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobOffer.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('company', 'name city profilePicture')
        .populate('domain')
        .populate('jobType'),
      JobOffer.countDocuments(filter)
    ]);

    return {
      jobs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };
  }
}

module.exports = new JobOfferService();
