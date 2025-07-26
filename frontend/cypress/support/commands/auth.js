// Authentication related custom commands

/**
 * Login as a student user
 * @param {Object} userData - Optional user data override
 */
Cypress.Commands.add('loginAsStudent', (userData = {}) => {
  const defaultStudent = {
    user: {
      _id: 'student123',
      isStudent: true,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      profilePicture: 'john-profile.jpg',
      ...userData.user
    },
    token: 'student-token-123',
    ...userData
  }

  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify(defaultStudent))
  })

  // Set up student-specific intercepts
  cy.intercept('GET', '/api/jobApplications/student/*', { fixture: 'studentApplications.json' }).as('getStudentApplications')
  cy.intercept('GET', '/api/jobApplications/check/*', { body: { hasApplied: false } }).as('checkApplication')
  cy.intercept('POST', '/api/jobApplications', { 
    statusCode: 201, 
    body: { _id: 'app123', status: 'pending' } 
  }).as('createApplication')
})

/**
 * Login as a company user
 * @param {Object} userData - Optional user data override
 */
Cypress.Commands.add('loginAsCompany', (userData = {}) => {
  const defaultCompany = {
    user: {
      _id: 'company123',
      isCompany: true,
      name: 'Tech Corp',
      email: 'company@techcorp.com',
      city: 'Paris',
      profilePicture: 'tech-corp-logo.jpg',
      ...userData.user
    },
    token: 'company-token-123',
    ...userData
  }

  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify(defaultCompany))
  })

  // Set up company-specific intercepts
  cy.intercept('GET', '/api/jobOffers/company/*', { fixture: 'companyJobOffers.json' }).as('getCompanyJobs')
  cy.intercept('GET', '/api/jobApplications/company/*', { fixture: 'companyApplications.json' }).as('getCompanyApplications')
  cy.intercept('GET', '/api/jobApplications/company/*/stats', { fixture: 'companyStats.json' }).as('getCompanyStats')
  cy.intercept('GET', '/api/jobApplications/company/*/recent*', { fixture: 'recentApplications.json' }).as('getRecentApplications')
})

/**
 * Logout current user
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('user')
  })
  cy.clearLocalStorage()
})

/**
 * Login via UI form
 * @param {string} email 
 * @param {string} password 
 */
Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login')
  
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('input[type="submit"]').click()
  
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard')
})

/**
 * Check if user is authenticated
 */
Cypress.Commands.add('shouldBeAuthenticated', () => {
  cy.window().its('localStorage.user').should('exist')
  cy.url().should('not.include', '/login')
})

/**
 * Check if user is not authenticated
 */
Cypress.Commands.add('shouldNotBeAuthenticated', () => {
  cy.window().its('localStorage.user').should('not.exist')
})
