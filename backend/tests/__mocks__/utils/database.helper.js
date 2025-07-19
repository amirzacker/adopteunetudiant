const mockingoose = require("mockingoose");

/**
 * Database Helper for Tests
 * Provides utilities for mocking database operations
 */
class DatabaseHelper {
  constructor() {
    this.mockData = new Map();
  }

  /**
   * Reset all mocks
   */
  resetAllMocks() {
    mockingoose.resetAll();
    this.mockData.clear();
  }

  /**
   * Mock a model's find operation
   * @param {object} Model - Mongoose model
   * @param {Array|object} data - Data to return
   * @param {string} operation - Operation type (default: 'find')
   */
  mockFind(Model, data, operation = 'find') {
    mockingoose(Model).toReturn(data, operation);
    this.mockData.set(`${Model.modelName}_${operation}`, data);
  }

  /**
   * Mock a model's findOne operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockFindOne(Model, data) {
    this.mockFind(Model, data, 'findOne');
  }

  /**
   * Mock a model's findById operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockFindById(Model, data) {
    this.mockFind(Model, data, 'findOne');
  }

  /**
   * Mock a model's save operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockSave(Model, data) {
    this.mockFind(Model, data, 'save');
  }

  /**
   * Mock a model's create operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockCreate(Model, data) {
    this.mockFind(Model, data, 'save');
  }

  /**
   * Mock a model's findOneAndUpdate operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockFindOneAndUpdate(Model, data) {
    this.mockFind(Model, data, 'findOneAndUpdate');
  }

  /**
   * Mock a model's findByIdAndUpdate operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockFindByIdAndUpdate(Model, data) {
    this.mockFind(Model, data, 'findOneAndUpdate');
  }

  /**
   * Mock a model's findOneAndDelete operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockFindOneAndDelete(Model, data) {
    this.mockFind(Model, data, 'findOneAndRemove');
  }

  /**
   * Mock a model's findByIdAndDelete operation
   * @param {object} Model - Mongoose model
   * @param {object} data - Data to return
   */
  mockFindByIdAndDelete(Model, data) {
    this.mockFind(Model, data, 'findOneAndRemove');
  }

  /**
   * Mock a model's deleteOne operation
   * @param {object} Model - Mongoose model
   * @param {object} result - Result to return (e.g., { deletedCount: 1 })
   */
  mockDeleteOne(Model, result = { deletedCount: 1 }) {
    this.mockFind(Model, result, 'deleteOne');
  }

  /**
   * Mock a model's deleteMany operation
   * @param {object} Model - Mongoose model
   * @param {object} result - Result to return (e.g., { deletedCount: 3 })
   */
  mockDeleteMany(Model, result = { deletedCount: 1 }) {
    this.mockFind(Model, result, 'deleteMany');
  }

  /**
   * Mock a model's countDocuments operation
   * @param {object} Model - Mongoose model
   * @param {number} count - Count to return
   */
  mockCountDocuments(Model, count = 0) {
    this.mockFind(Model, count, 'countDocuments');
  }

  /**
   * Mock a model's aggregate operation
   * @param {object} Model - Mongoose model
   * @param {Array} data - Aggregation result to return
   */
  mockAggregate(Model, data) {
    this.mockFind(Model, data, 'aggregate');
  }

  /**
   * Setup complete CRUD mocks for a model
   * @param {object} Model - Mongoose model
   * @param {object} options - Mock options
   */
  setupCRUDMocks(Model, options = {}) {
    const {
      findData = [],
      findOneData = null,
      saveData = null,
      updateData = null,
      deleteResult = { deletedCount: 1 },
      countResult = 0
    } = options;

    // Read operations
    if (findData) this.mockFind(Model, findData);
    if (findOneData) this.mockFindOne(Model, findOneData);

    // Create/Update operations
    if (saveData) this.mockSave(Model, saveData);
    if (updateData) this.mockFindOneAndUpdate(Model, updateData);

    // Delete operations
    this.mockDeleteOne(Model, deleteResult);
    this.mockDeleteMany(Model, deleteResult);

    // Count operations
    this.mockCountDocuments(Model, countResult);
  }

  /**
   * Mock error for a specific operation
   * @param {object} Model - Mongoose model
   * @param {string} operation - Operation to mock error for
   * @param {Error} error - Error to throw
   */
  mockError(Model, operation, error = new Error('Database error')) {
    mockingoose(Model).toReturn(error, operation);
  }

  /**
   * Mock validation error
   * @param {object} Model - Mongoose model
   * @param {string} operation - Operation to mock error for
   * @param {object} validationErrors - Validation error details
   */
  mockValidationError(Model, operation = 'save', validationErrors = {}) {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = validationErrors;
    this.mockError(Model, operation, error);
  }

  /**
   * Mock duplicate key error
   * @param {object} Model - Mongoose model
   * @param {string} operation - Operation to mock error for
   * @param {string} field - Field that caused the duplicate error
   */
  mockDuplicateKeyError(Model, operation = 'save', field = 'email') {
    const error = new Error('Duplicate key error');
    error.name = 'MongoError';
    error.code = 11000;
    error.keyPattern = { [field]: 1 };
    this.mockError(Model, operation, error);
  }

  /**
   * Mock cast error (invalid ObjectId)
   * @param {object} Model - Mongoose model
   * @param {string} operation - Operation to mock error for
   */
  mockCastError(Model, operation = 'findOne') {
    const error = new Error('Cast to ObjectId failed');
    error.name = 'CastError';
    error.kind = 'ObjectId';
    this.mockError(Model, operation, error);
  }

  /**
   * Get mocked data for a model and operation
   * @param {string} modelName - Model name
   * @param {string} operation - Operation name
   * @returns {*} Mocked data
   */
  getMockedData(modelName, operation) {
    return this.mockData.get(`${modelName}_${operation}`);
  }

  /**
   * Check if a model operation is mocked
   * @param {string} modelName - Model name
   * @param {string} operation - Operation name
   * @returns {boolean} True if mocked
   */
  isMocked(modelName, operation) {
    return this.mockData.has(`${modelName}_${operation}`);
  }

  /**
   * Setup mocks for pagination
   * @param {object} Model - Mongoose model
   * @param {Array} data - Data to paginate
   * @param {object} paginationOptions - Pagination options
   */
  mockPagination(Model, data, paginationOptions = {}) {
    const {
      page = 1,
      limit = 10,
      total = data.length
    } = paginationOptions;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    this.mockFind(Model, paginatedData);
    this.mockCountDocuments(Model, total);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Setup mocks for search operations
   * @param {object} Model - Mongoose model
   * @param {Array} allData - All available data
   * @param {string} searchTerm - Search term
   * @param {Array} searchFields - Fields to search in
   */
  mockSearch(Model, allData, searchTerm, searchFields = ['name', 'email']) {
    const filteredData = allData.filter(item => {
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    this.mockFind(Model, filteredData);
    return filteredData;
  }

  /**
   * Get nested value from object using dot notation
   * @param {object} obj - Object to search in
   * @param {string} path - Dot notation path
   * @returns {*} Value at path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  /**
   * Setup mocks for filtering operations
   * @param {object} Model - Mongoose model
   * @param {Array} allData - All available data
   * @param {object} filters - Filter criteria
   */
  mockFilter(Model, allData, filters) {
    const filteredData = allData.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        const itemValue = this.getNestedValue(item, key);
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        return itemValue === value;
      });
    });

    this.mockFind(Model, filteredData);
    return filteredData;
  }
}

// Export singleton instance
module.exports = new DatabaseHelper();
