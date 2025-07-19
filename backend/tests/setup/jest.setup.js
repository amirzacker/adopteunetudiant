/**
 * Jest Setup Configuration
 * Global test setup and configuration
 */

const databaseHelper = require("../__mocks__/utils/database.helper");

// Global test timeout
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  // Suppress console logs during tests unless explicitly needed
  if (process.env.NODE_ENV === 'test' && !process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

// Setup before each test
beforeEach(() => {
  // Reset all database mocks before each test
  databaseHelper.resetAllMocks();
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Reset all modules
  jest.resetModules();
});

// Setup after each test
afterEach(() => {
  // Clean up any remaining mocks
  jest.clearAllMocks();
});

// Setup after all tests
afterAll(async () => {
  // Final cleanup
  databaseHelper.resetAllMocks();
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to generate random test data
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Helper to generate random email
  randomEmail: () => {
    return `test${Math.random().toString(36).substring(7)}@example.com`;
  },
  
  // Helper to generate random ObjectId
  randomObjectId: () => {
    return Math.random().toString(16).substring(2, 26).padStart(24, '0');
  }
};

// Custom matchers
expect.extend({
  toBeValidObjectId(received) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const pass = objectIdRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },
  
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
  
  toHaveValidJWTStructure(received) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    const pass = jwtRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have valid JWT structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have valid JWT structure`,
        pass: false,
      };
    }
  }
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = {};
