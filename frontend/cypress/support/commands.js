// ***********************************************
// Custom commands for the Adopte un Étudiant application
// ***********************************************

// Common intercepts setup
Cypress.Commands.add('setupCommonIntercepts', () => {
  // API intercepts that are used across multiple tests
  cy.intercept('GET', '/api/domains', { fixture: 'domains.json' }).as('getDomains')
  cy.intercept('GET', '/api/searchTypes', { fixture: 'jobTypes.json' }).as('getJobTypes')
  cy.intercept('GET', '/api/jobOffers*', { fixture: 'jobOffers.json' }).as('getJobOffers')
})

// Wait for common API calls
Cypress.Commands.add('waitForCommonAPIs', () => {
  cy.wait(['@getDomains', '@getJobTypes', '@getJobOffers'])
})

// Authentication commands
Cypress.Commands.add('loginAsStudent', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({
      user: {
        _id: 'student123',
        isCompany: false,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        domain: { _id: 'domain1', name: 'Informatique' },
        city: 'Paris'
      },
      token: 'student-token'
    }))
  })
})

Cypress.Commands.add('loginAsCompany', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({
      user: {
        _id: 'company123',
        isCompany: true,
        name: 'Tech Corp',
        email: 'company@techcorp.com'
      },
      token: 'company-token'
    }))
  })
})

// Mock successful API responses
Cypress.Commands.add('mockSuccessfulAPIs', () => {
  cy.intercept('GET', '/api/domains', { fixture: 'domains.json' }).as('getDomains')
  cy.intercept('GET', '/api/searchTypes', { fixture: 'jobTypes.json' }).as('getJobTypes')
  cy.intercept('GET', '/api/jobOffers*', { fixture: 'jobOffers.json' }).as('getJobOffers')
  cy.intercept('GET', '/api/jobApplications/student/*', { fixture: 'studentApplications.json' }).as('getStudentApplications')
  cy.intercept('GET', '/api/jobOffers/company/*', { fixture: 'companyJobOffers.json' }).as('getCompanyJobs')
  cy.intercept('GET', '/api/jobApplications/company/*', { fixture: 'companyApplications.json' }).as('getCompanyApplications')
  cy.intercept('POST', '/api/uploads', { statusCode: 200, body: { url: '/uploads/test-file.jpg' } }).as('uploadFile')
})

// Navigation commands
Cypress.Commands.add('navigateInDashboard', (section) => {
  cy.get('body').then(($body) => {
    switch (section) {
      case 'home':
        if ($body.find('.home-icon, [data-testid="home-nav"]').length > 0) {
          cy.get('.home-icon, [data-testid="home-nav"]').first().click()
        } else {
          cy.visit('/dashboard')
        }
        break
      case 'applications':
        if ($body.find('[href*="applications"], [data-testid="applications-nav"]').length > 0) {
          cy.get('[href*="applications"], [data-testid="applications-nav"]').first().click()
        } else {
          cy.visit('/my-applications')
        }
        break
      case 'company-jobs':
        if ($body.find('[href*="company-jobs"], [data-testid="jobs-nav"]').length > 0) {
          cy.get('[href*="company-jobs"], [data-testid="jobs-nav"]').first().click()
        } else {
          cy.visit('/company-jobs')
        }
        break
      case 'company-applications':
        if ($body.find('[href*="company-applications"], [data-testid="company-applications-nav"]').length > 0) {
          cy.get('[href*="company-applications"], [data-testid="company-applications-nav"]').first().click()
        } else {
          cy.visit('/company-applications')
        }
        break
      case 'profile':
        // Profile is typically managed within the dashboard, not a separate route
        if ($body.find('[href*="profile"], [data-testid="profile-nav"]').length > 0) {
          cy.get('[href*="profile"], [data-testid="profile-nav"]').first().click()
        } else {
          cy.visit('/dashboard')
        }
        break
      default:
        cy.visit('/dashboard')
    }
  })
})

// Message assertion commands
Cypress.Commands.add('shouldHaveSuccessMessage', (message) => {
  cy.get('body').then(($body) => {
    if ($body.find('.alert-success, .success, .toast-success').length > 0) {
      cy.get('.alert-success, .success, .toast-success').should('contain.text', message)
    } else {
      cy.contains(message).should('be.visible')
    }
  })
})

Cypress.Commands.add('shouldHaveErrorMessage', (message) => {
  cy.get('body').then(($body) => {
    if ($body.find('.alert-danger, .error, .toast-error').length > 0) {
      cy.get('.alert-danger, .error, .toast-error').should('contain.text', message)
    } else {
      cy.contains(message).should('be.visible')
    }
  })
})

// File upload mock
Cypress.Commands.add('mockFileUpload', (filename, mimeType) => {
  cy.intercept('POST', '/api/uploads', {
    statusCode: 200,
    body: { url: `/uploads/${filename}` }
  }).as('uploadFile')
})

// Custom tab command for accessibility testing
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  const focusable = subject || cy.get('body')
  return focusable.trigger('keydown', { key: 'Tab', code: 'Tab', keyCode: 9 })
})

// Custom command to check accessibility
Cypress.Commands.add('checkA11y', (selector = null, options = {}) => {
  const defaultOptions = {
    includedImpacts: ['critical', 'serious'],
    ...options
  }

  if (selector) {
    cy.get(selector).should('be.visible')
  }

  // Basic accessibility checks
  cy.get('[role]').should('exist')
  cy.get('img').should('have.attr', 'alt')
  cy.get('input').should('have.attr', 'aria-label').or('have.attr', 'placeholder')
})
