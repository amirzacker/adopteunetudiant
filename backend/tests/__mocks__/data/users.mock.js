/**
 * Mock data for Users
 * Provides consistent test data for user-related tests
 */

const authHelper = require("../utils/auth.helper");
const { defaultCompanyId, defaultStudentId, defaultAdminId } = authHelper.getDefaultIds();

/**
 * Mock user data
 */
const mockUsers = {
  student: {
    _id: defaultStudentId,
    name: "John Student",
    email: "john.student@test.com",
    password: "hashedPassword123",
    role: "student",
    type: "student",
    profile: {
      firstName: "John",
      lastName: "Student",
      phone: "+33123456789",
      address: "123 Student Street, Paris",
      dateOfBirth: "1995-05-15",
      skills: ["JavaScript", "React", "Node.js"],
      education: "Master in Computer Science",
      experience: "2 years"
    },
    preferences: {
      jobTypes: ["internship", "part-time"],
      locations: ["Paris", "Lyon"],
      domains: ["web-development", "mobile-development"]
    },
    createdAt: "2023-01-15T10:00:00.000Z",
    updatedAt: "2023-01-15T10:00:00.000Z"
  },

  company: {
    _id: defaultCompanyId,
    name: "Tech Company Inc",
    email: "contact@techcompany.com",
    password: "hashedPassword456",
    role: "company",
    type: "company",
    profile: {
      companyName: "Tech Company Inc",
      siret: "12345678901234",
      address: "456 Business Avenue, Paris",
      phone: "+33987654321",
      website: "https://techcompany.com",
      description: "Leading technology company specializing in web development",
      sector: "Technology",
      size: "50-100 employees"
    },
    preferences: {
      studentProfiles: ["computer-science", "engineering"],
      contractTypes: ["internship", "apprenticeship"],
      locations: ["Paris", "Remote"]
    },
    createdAt: "2023-01-10T09:00:00.000Z",
    updatedAt: "2023-01-10T09:00:00.000Z"
  },

  admin: {
    _id: defaultAdminId,
    name: "Admin User",
    email: "admin@adopteunetudiant.com",
    password: "hashedAdminPassword789",
    role: "admin",
    type: "admin",
    profile: {
      firstName: "Admin",
      lastName: "User",
      permissions: ["manage_users", "manage_companies", "manage_adoptions", "view_analytics"]
    },
    createdAt: "2023-01-01T08:00:00.000Z",
    updatedAt: "2023-01-01T08:00:00.000Z"
  }
};

/**
 * Mock user arrays for list operations
 */
const mockUserArrays = {
  students: [
    mockUsers.student,
    {
      _id: "507f1f77bcf86cd799439014",
      name: "Jane Student",
      email: "jane.student@test.com",
      role: "student",
      type: "student",
      profile: {
        firstName: "Jane",
        lastName: "Student",
        skills: ["Python", "Django", "PostgreSQL"]
      }
    },
    {
      _id: "507f1f77bcf86cd799439015",
      name: "Bob Student",
      email: "bob.student@test.com",
      role: "student",
      type: "student",
      profile: {
        firstName: "Bob",
        lastName: "Student",
        skills: ["Java", "Spring", "MySQL"]
      }
    }
  ],

  companies: [
    mockUsers.company,
    {
      _id: "507f1f77bcf86cd799439016",
      name: "Startup Innovation",
      email: "contact@startup.com",
      role: "company",
      type: "company",
      profile: {
        companyName: "Startup Innovation",
        sector: "Fintech",
        size: "10-50 employees"
      }
    },
    {
      _id: "507f1f77bcf86cd799439017",
      name: "Enterprise Corp",
      email: "hr@enterprise.com",
      role: "company",
      type: "company",
      profile: {
        companyName: "Enterprise Corp",
        sector: "Banking",
        size: "500+ employees"
      }
    }
  ],

  mixed: [
    mockUsers.student,
    mockUsers.company,
    mockUsers.admin
  ]
};

/**
 * Mock user creation data (without IDs and timestamps)
 */
const mockUserCreationData = {
  student: {
    name: "New Student",
    email: "new.student@test.com",
    password: "newPassword123",
    role: "student",
    type: "student",
    profile: {
      firstName: "New",
      lastName: "Student",
      phone: "+33111222333",
      skills: ["Vue.js", "TypeScript"]
    }
  },

  company: {
    name: "New Company",
    email: "new@company.com",
    password: "newCompanyPass456",
    role: "company",
    type: "company",
    profile: {
      companyName: "New Company",
      siret: "98765432109876",
      sector: "E-commerce",
      size: "20-50 employees"
    }
  }
};

/**
 * Mock user update data
 */
const mockUserUpdateData = {
  student: {
    profile: {
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
      experience: "3 years"
    },
    preferences: {
      jobTypes: ["full-time", "internship"]
    }
  },

  company: {
    profile: {
      description: "Updated company description with new services",
      website: "https://updated-techcompany.com"
    },
    preferences: {
      contractTypes: ["full-time", "internship", "apprenticeship"]
    }
  }
};

/**
 * Mock invalid user data for validation tests
 */
const mockInvalidUserData = {
  missingEmail: {
    name: "Test User",
    password: "password123",
    role: "student"
  },

  invalidEmail: {
    name: "Test User",
    email: "invalid-email",
    password: "password123",
    role: "student"
  },

  missingPassword: {
    name: "Test User",
    email: "test@test.com",
    role: "student"
  },

  invalidRole: {
    name: "Test User",
    email: "test@test.com",
    password: "password123",
    role: "invalid-role"
  },

  emptyName: {
    name: "",
    email: "test@test.com",
    password: "password123",
    role: "student"
  }
};

/**
 * Mock authentication responses
 */
const mockAuthResponses = {
  loginSuccess: {
    token: authHelper.generateStudentToken(),
    user: {
      _id: defaultStudentId,
      name: "John Student",
      email: "john.student@test.com",
      role: "student"
    }
  },

  loginFailure: {
    error: "Invalid credentials",
    message: "Email or password is incorrect"
  },

  registerSuccess: {
    message: "User created successfully",
    user: {
      _id: "507f1f77bcf86cd799439018",
      name: "New User",
      email: "new@test.com",
      role: "student"
    }
  }
};

module.exports = {
  mockUsers,
  mockUserArrays,
  mockUserCreationData,
  mockUserUpdateData,
  mockInvalidUserData,
  mockAuthResponses
};
