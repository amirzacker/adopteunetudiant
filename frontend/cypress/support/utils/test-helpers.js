// Test helper utilities

/**
 * Generate test data
 */
export const TestData = {
  student: (overrides = {}) => ({
    _id: 'student123',
    isStudent: true,
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    profilePicture: 'john-profile.jpg',
    ...overrides
  }),

  company: (overrides = {}) => ({
    _id: 'company123',
    isCompany: true,
    name: 'Tech Corp',
    email: 'company@techcorp.com',
    city: 'Paris',
    profilePicture: 'tech-corp-logo.jpg',
    ...overrides
  }),

  jobOffer: (overrides = {}) => ({
    _id: 'job123',
    title: 'Frontend Developer',
    description: 'We are looking for a skilled frontend developer...',
    location: 'Paris',
    requirements: 'React, JavaScript, CSS, HTML',
    salary: '35000-45000',
    duration: '6 months',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-06-30T00:00:00.000Z',
    status: 'published',
    company: {
      _id: 'company123',
      name: 'Tech Corp'
    },
    domain: {
      _id: 'domain1',
      name: 'Informatique'
    },
    jobType: {
      _id: 'type1',
      name: 'Stage'
    },
    ...overrides
  }),

  application: (overrides = {}) => ({
    _id: 'app123',
    status: 'pending',
    coverLetter: 'I am very interested in this position...',
    applicationDate: new Date().toISOString(),
    student: TestData.student(),
    jobOffer: TestData.jobOffer(),
    ...overrides
  })
}

/**
 * Common test patterns
 */
export const TestPatterns = {
  /**
   * Test a form submission flow
   */
  testFormSubmission: (formSelector, fillFormFn, submitSelector, expectedResult) => {
    cy.get(formSelector).should('be.visible')
    fillFormFn()
    cy.get(submitSelector).click()
    expectedResult()
  },

  /**
   * Test pagination
   */
  testPagination: (itemSelector, paginationSelector) => {
    cy.get(itemSelector).should('have.length.greaterThan', 0)
    cy.get(paginationSelector).should('be.visible')
    cy.get('button[aria-label="Go to page 2"]').click()
    cy.get(itemSelector).should('be.visible')
  },

  /**
   * Test search functionality
   */
  testSearch: (searchInputSelector, searchTerm, resultSelector) => {
    cy.get(searchInputSelector).type(searchTerm)
    cy.get(resultSelector).should('be.visible')
  },

  /**
   * Test modal interactions
   */
  testModal: (triggerSelector, modalSelector, closeSelector) => {
    cy.get(triggerSelector).click()
    cy.get(modalSelector).should('be.visible')
    cy.get(closeSelector).click()
    cy.get(modalSelector).should('not.exist')
  }
}

/**
 * Accessibility test helpers
 */
export const A11yHelpers = {
  /**
   * Test keyboard navigation
   */
  testKeyboardNavigation: (startSelector) => {
    cy.get(startSelector).focus()
    cy.focused().tab()
    cy.focused().should('be.visible')
  },

  /**
   * Test ARIA attributes
   */
  testARIAAttributes: (selector, expectedAttributes = {}) => {
    const element = cy.get(selector)
    Object.entries(expectedAttributes).forEach(([attr, value]) => {
      element.should('have.attr', attr, value)
    })
  },

  /**
   * Test screen reader announcements
   */
  testScreenReaderAnnouncements: (selector) => {
    cy.get(selector).should('have.attr', 'aria-live')
    cy.get(selector).should('have.attr', 'role')
  }
}

/**
 * Performance test helpers
 */
export const PerformanceHelpers = {
  /**
   * Measure page load time
   */
  measurePageLoad: (url) => {
    cy.visit(url)
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
      cy.log(`Page load time: ${loadTime}ms`)
      expect(loadTime).to.be.lessThan(5000) // 5 seconds max
    })
  },

  /**
   * Check for console errors
   */
  checkConsoleErrors: () => {
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })
    // At the end of test, check if console.error was called
    cy.get('@consoleError').should('not.have.been.called')
  }
}

/**
 * API test helpers
 */
export const APIHelpers = {
  /**
   * Verify API call structure
   */
  verifyAPICall: (alias, expectedStructure) => {
    cy.get(alias).then((interception) => {
      expect(interception.request).to.have.property('method')
      expect(interception.request).to.have.property('url')
      if (expectedStructure.body) {
        expect(interception.request.body).to.deep.include(expectedStructure.body)
      }
      if (expectedStructure.headers) {
        Object.entries(expectedStructure.headers).forEach(([key, value]) => {
          expect(interception.request.headers).to.have.property(key, value)
        })
      }
    })
  }
}
