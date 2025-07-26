// ***********************************************************
// This support file is processed and loaded automatically 
// before your test files for component tests.
// ***********************************************************

// Import commands for component testing
import './commands'

// Import React testing utilities
import { mount } from 'cypress/react18'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Example command for component testing
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  const { providers = [], ...mountOptions } = options
  
  let wrappedComponent = component
  
  // Wrap with providers if needed
  providers.forEach(Provider => {
    wrappedComponent = <Provider>{wrappedComponent}</Provider>
  })
  
  return cy.mount(wrappedComponent, mountOptions)
})
