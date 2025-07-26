// API related custom commands

/**
 * Mock successful API responses
 */
Cypress.Commands.add('mockSuccessfulAPIs', () => {
  cy.intercept('GET', '/api/jobOffers*', { fixture: 'jobOffers.json' }).as('getJobOffers')
  cy.intercept('GET', '/api/domains', { fixture: 'domains.json' }).as('getDomains')
  cy.intercept('GET', '/api/searchTypes', { fixture: 'jobTypes.json' }).as('getJobTypes')
  cy.intercept('POST', '/api/jobApplications', { 
    statusCode: 201, 
    body: { _id: 'app123', status: 'pending' } 
  }).as('createApplication')
  cy.intercept('POST', '/api/jobOffers', { 
    statusCode: 201, 
    body: { _id: 'job123', title: 'New Job', status: 'draft' } 
  }).as('createJob')
})

/**
 * Mock API errors
 */
Cypress.Commands.add('mockAPIErrors', () => {
  cy.intercept('GET', '/api/jobOffers*', { 
    statusCode: 500, 
    body: { error: 'Server error' } 
  }).as('getJobOffersError')
  cy.intercept('POST', '/api/jobApplications', { 
    statusCode: 400, 
    body: { error: 'Validation error' } 
  }).as('createApplicationError')
  cy.intercept('POST', '/api/jobOffers', { 
    statusCode: 400, 
    body: { error: 'Validation error' } 
  }).as('createJobError')
})

/**
 * Mock empty responses
 */
Cypress.Commands.add('mockEmptyResponses', () => {
  cy.intercept('GET', '/api/jobOffers*', { body: [] }).as('getEmptyJobOffers')
  cy.intercept('GET', '/api/jobApplications/student/*', { body: [] }).as('getEmptyStudentApplications')
  cy.intercept('GET', '/api/jobOffers/company/*', { body: [] }).as('getEmptyCompanyJobs')
})

/**
 * Mock authentication API calls
 */
Cypress.Commands.add('mockAuthAPIs', () => {
  cy.intercept('POST', '/api/login', {
    statusCode: 200,
    body: {
      user: { _id: 'user123', email: 'test@example.com', isStudent: true },
      token: 'mock-token'
    }
  }).as('loginAPI')

  cy.intercept('POST', '/api/users', {
    statusCode: 201,
    body: {
      user: { _id: 'user123', email: 'test@example.com', isStudent: true },
      token: 'mock-token'
    }
  }).as('registerAPI')

  cy.intercept('POST', '/api/logout', {
    statusCode: 200,
    body: { message: 'Logged out successfully' }
  }).as('logoutAPI')

  // Mock user profile fetch
  cy.intercept('GET', '/api/users/*', {
    statusCode: 200,
    body: {
      _id: 'user123',
      email: 'test@example.com',
      isStudent: true,
      firstname: 'Test',
      lastname: 'User'
    }
  }).as('getUserProfile')
})

/**
 * Setup common API intercepts used across tests
 */
Cypress.Commands.add('setupCommonIntercepts', () => {
  cy.intercept('GET', '/api/jobOffers*', { fixture: 'jobOffers.json' }).as('getJobOffers')
  cy.intercept('GET', '/api/domains', { fixture: 'domains.json' }).as('getDomains')
  cy.intercept('GET', '/api/searchTypes', { fixture: 'jobTypes.json' }).as('getJobTypes')
  cy.intercept('POST', '/api/login', {
    statusCode: 200,
    body: {
      user: { _id: 'user123', email: 'test@example.com', isStudent: true },
      token: 'mock-token'
    }
  }).as('loginAPI')

  // Mock user profile fetch that happens after login
  cy.intercept('GET', '/api/users/*', {
    statusCode: 200,
    body: {
      _id: 'user123',
      email: 'test@example.com',
      isStudent: true,
      firstname: 'Test',
      lastname: 'User'
    }
  }).as('getUserProfile')
})

/**
 * Wait for all common API calls to complete
 */
Cypress.Commands.add('waitForCommonAPIs', (...aliases) => {
  const defaultAliases = ['@getJobOffers', '@getDomains', '@getJobTypes']
  const allAliases = aliases.length > 0 ? aliases : defaultAliases
  cy.wait(allAliases)
})

/**
 * Wait for all common API calls to complete (legacy alias)
 */
Cypress.Commands.add('waitForAPIs', (...aliases) => {
  const defaultAliases = ['@getJobOffers', '@getDomains', '@getJobTypes']
  const allAliases = aliases.length > 0 ? aliases : defaultAliases
  cy.wait(allAliases)
})

/**
 * Mock file upload
 */
Cypress.Commands.add('mockFileUpload', (fileName = 'test-file.pdf', mimeType = 'application/pdf') => {
  cy.intercept('POST', '/api/upload', { 
    statusCode: 200, 
    body: { 
      filename: fileName,
      path: `/uploads/${fileName}`,
      size: 1024 
    } 
  }).as('uploadFile')
})

/**
 * Check API call was made with correct parameters
 */
Cypress.Commands.add('shouldHaveAPICall', (alias, expectedParams = {}) => {
  cy.get(alias).should((interception) => {
    if (expectedParams.method) {
      expect(interception.request.method).to.equal(expectedParams.method)
    }
    if (expectedParams.url) {
      expect(interception.request.url).to.include(expectedParams.url)
    }
    if (expectedParams.body) {
      expect(interception.request.body).to.deep.include(expectedParams.body)
    }
  })
})
