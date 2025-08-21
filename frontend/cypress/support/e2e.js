// ***********************************************************
// This support file is processed and loaded automatically 
// before your test files for e2e tests.
// ***********************************************************

// Import commands
import './commands'
import './commands/auth'
import './commands/api'
import './commands/ui'

// Import utilities
import './utils/test-helpers'

// Import Cypress grep plugin (optional)
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('@cypress/grep/src/support')
} catch (e) {
  // plugin not installed - skip
}

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that are not related to our tests
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  return true
})

// Global before hook
beforeEach(() => {
  // Clear localStorage and sessionStorage before each test
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Set up common intercepts
  cy.setupCommonIntercepts()
})
