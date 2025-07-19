/**
 * User Factory for Test Data Generation
 * Provides dynamic generation of user test data
 */

const { faker } = require('@faker-js/faker');

/**
 * User Factory Class
 */
class UserFactory {
  /**
   * Generate a random student user
   * @param {object} overrides - Properties to override
   * @returns {object} Generated student user
   */
  static createStudent(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
      _id: faker.database.mongodbObjectId(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email(firstName, lastName).toLowerCase(),
      password: faker.internet.password(),
      role: "student",
      type: "student",
      profile: {
        firstName,
        lastName,
        phone: faker.phone.number('+33#########'),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
        dateOfBirth: faker.date.birthdate({ min: 18, max: 30, mode: 'age' }).toISOString().split('T')[0],
        skills: faker.helpers.arrayElements([
          'JavaScript', 'Python', 'Java', 'React', 'Vue.js', 'Angular',
          'Node.js', 'Django', 'Spring', 'MongoDB', 'PostgreSQL', 'MySQL',
          'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript', 'PHP'
        ], { min: 2, max: 6 }),
        education: faker.helpers.arrayElement([
          'Bachelor in Computer Science',
          'Master in Software Engineering',
          'Bachelor in Information Technology',
          'Master in Data Science',
          'Bachelor in Web Development'
        ]),
        experience: faker.helpers.arrayElement(['0 years', '1 year', '2 years', '3 years'])
      },
      preferences: {
        jobTypes: faker.helpers.arrayElements(['internship', 'part-time', 'full-time', 'freelance'], { min: 1, max: 3 }),
        locations: faker.helpers.arrayElements(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Remote'], { min: 1, max: 3 }),
        domains: faker.helpers.arrayElements([
          'web-development', 'mobile-development', 'data-science', 
          'cybersecurity', 'devops', 'ai-ml'
        ], { min: 1, max: 3 })
      },
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
      updatedAt: faker.date.recent({ days: 7 }).toISOString(),
      ...overrides
    };
  }

  /**
   * Generate a random company user
   * @param {object} overrides - Properties to override
   * @returns {object} Generated company user
   */
  static createCompany(overrides = {}) {
    const companyName = faker.company.name();
    
    return {
      _id: faker.database.mongodbObjectId(),
      name: companyName,
      email: faker.internet.email('contact', companyName.replace(/\s+/g, '').toLowerCase()).toLowerCase(),
      password: faker.internet.password(),
      role: "company",
      type: "company",
      profile: {
        companyName,
        siret: faker.string.numeric(14),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
        phone: faker.phone.number('+33#########'),
        website: faker.internet.url(),
        description: faker.company.catchPhrase() + '. ' + faker.lorem.sentences(2),
        sector: faker.helpers.arrayElement([
          'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
          'Manufacturing', 'Consulting', 'Media', 'Transportation', 'Energy'
        ]),
        size: faker.helpers.arrayElement([
          '1-10 employees', '10-50 employees', '50-100 employees',
          '100-500 employees', '500+ employees'
        ])
      },
      preferences: {
        studentProfiles: faker.helpers.arrayElements([
          'computer-science', 'engineering', 'business', 'design', 'marketing'
        ], { min: 1, max: 3 }),
        contractTypes: faker.helpers.arrayElements([
          'internship', 'apprenticeship', 'part-time', 'full-time'
        ], { min: 1, max: 3 }),
        locations: faker.helpers.arrayElements([
          'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Remote'
        ], { min: 1, max: 3 })
      },
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      updatedAt: faker.date.recent({ days: 14 }).toISOString(),
      ...overrides
    };
  }

  /**
   * Generate a random admin user
   * @param {object} overrides - Properties to override
   * @returns {object} Generated admin user
   */
  static createAdmin(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
      _id: faker.database.mongodbObjectId(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email(firstName, lastName, 'adopteunetudiant.com').toLowerCase(),
      password: faker.internet.password(),
      role: "admin",
      type: "admin",
      profile: {
        firstName,
        lastName,
        permissions: faker.helpers.arrayElements([
          'manage_users', 'manage_companies', 'manage_adoptions',
          'view_analytics', 'manage_content', 'system_admin'
        ], { min: 2, max: 6 })
      },
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
      ...overrides
    };
  }

  /**
   * Generate multiple students
   * @param {number} count - Number of students to generate
   * @param {object} overrides - Properties to override for all students
   * @returns {Array} Array of generated students
   */
  static createStudents(count = 3, overrides = {}) {
    return Array.from({ length: count }, () => this.createStudent(overrides));
  }

  /**
   * Generate multiple companies
   * @param {number} count - Number of companies to generate
   * @param {object} overrides - Properties to override for all companies
   * @returns {Array} Array of generated companies
   */
  static createCompanies(count = 3, overrides = {}) {
    return Array.from({ length: count }, () => this.createCompany(overrides));
  }

  /**
   * Generate multiple admins
   * @param {number} count - Number of admins to generate
   * @param {object} overrides - Properties to override for all admins
   * @returns {Array} Array of generated admins
   */
  static createAdmins(count = 2, overrides = {}) {
    return Array.from({ length: count }, () => this.createAdmin(overrides));
  }

  /**
   * Generate mixed user types
   * @param {object} counts - Object specifying count for each type
   * @returns {Array} Array of mixed user types
   */
  static createMixedUsers(counts = { students: 2, companies: 2, admins: 1 }) {
    const users = [];
    
    if (counts.students) {
      users.push(...this.createStudents(counts.students));
    }
    
    if (counts.companies) {
      users.push(...this.createCompanies(counts.companies));
    }
    
    if (counts.admins) {
      users.push(...this.createAdmins(counts.admins));
    }
    
    return faker.helpers.shuffle(users);
  }

  /**
   * Generate user creation data (without _id and timestamps)
   * @param {string} type - User type ('student', 'company', 'admin')
   * @param {object} overrides - Properties to override
   * @returns {object} User creation data
   */
  static createUserData(type = 'student', overrides = {}) {
    let userData;
    
    switch (type) {
      case 'student':
        userData = this.createStudent(overrides);
        break;
      case 'company':
        userData = this.createCompany(overrides);
        break;
      case 'admin':
        userData = this.createAdmin(overrides);
        break;
      default:
        throw new Error(`Invalid user type: ${type}`);
    }
    
    // Remove fields that shouldn't be in creation data
    const { _id, createdAt, updatedAt, ...creationData } = userData;
    return creationData;
  }

  /**
   * Generate invalid user data for testing validation
   * @param {string} invalidationType - Type of validation error to simulate
   * @returns {object} Invalid user data
   */
  static createInvalidUserData(invalidationType = 'missingEmail') {
    const baseData = this.createUserData('student');
    
    switch (invalidationType) {
      case 'missingEmail':
        delete baseData.email;
        break;
      case 'invalidEmail':
        baseData.email = 'invalid-email-format';
        break;
      case 'missingPassword':
        delete baseData.password;
        break;
      case 'invalidRole':
        baseData.role = 'invalid-role';
        break;
      case 'emptyName':
        baseData.name = '';
        break;
      case 'duplicateEmail':
        baseData.email = 'existing@test.com';
        break;
      default:
        throw new Error(`Invalid invalidation type: ${invalidationType}`);
    }
    
    return baseData;
  }

  /**
   * Generate user update data
   * @param {string} type - User type
   * @param {object} overrides - Properties to override
   * @returns {object} User update data
   */
  static createUpdateData(type = 'student', overrides = {}) {
    let updateData;
    
    switch (type) {
      case 'student':
        updateData = {
          profile: {
            skills: faker.helpers.arrayElements([
              'JavaScript', 'Python', 'React', 'Vue.js', 'Node.js'
            ], { min: 2, max: 4 }),
            experience: faker.helpers.arrayElement(['1 year', '2 years', '3 years'])
          },
          preferences: {
            jobTypes: faker.helpers.arrayElements(['internship', 'part-time', 'full-time'], { min: 1, max: 2 })
          }
        };
        break;
      case 'company':
        updateData = {
          profile: {
            description: faker.company.catchPhrase() + '. ' + faker.lorem.sentence(),
            website: faker.internet.url()
          },
          preferences: {
            contractTypes: faker.helpers.arrayElements(['internship', 'full-time'], { min: 1, max: 2 })
          }
        };
        break;
      default:
        updateData = {};
    }
    
    return { ...updateData, ...overrides };
  }
}

module.exports = UserFactory;
