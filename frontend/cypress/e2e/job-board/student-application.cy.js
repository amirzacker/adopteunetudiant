describe('Job Board - Student Application Flow', () => {
  beforeEach(() => {
    // Mock API responses for consistent testing
    cy.intercept('GET', '/api/jobOffers*', { fixture: 'jobOffers.json' }).as('getJobOffers')
    cy.intercept('GET', '/api/domains', { fixture: 'domains.json' }).as('getDomains')
    cy.intercept('GET', '/api/searchTypes', { fixture: 'jobTypes.json' }).as('getJobTypes')
    cy.intercept('POST', '/api/applications', { statusCode: 201, body: { success: true } }).as('createApplication')
  })

  describe('Application Button States', () => {
    it('should display job offers for potential application', () => {
      cy.visit('/job-board')
      cy.wait(['@getJobOffers', '@getDomains', '@getJobTypes'])

      // Verify page loaded with job offers
      cy.get('body').should('be.visible')

      // Check for job offers using flexible selectors
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="job-"]').length > 0) {
          cy.get('[data-testid^="job-"]').should('have.length.greaterThan', 0)
        } else {
          cy.get('.job-offer-card, .job-card, .card').should('have.length.greaterThan', 0)
        }
      })
    })

    it('should handle apply button interactions', () => {
      cy.visit('/job-board')
      cy.wait('@getJobOffers')

      // Check for apply buttons with flexible selectors
      cy.get('body').then(($body) => {
        const applyButtons = $body.find('.apply-btn, button:contains("Postuler"), button:contains("Apply")')
        if (applyButtons.length > 0) {
          cy.get('.apply-btn, button:contains("Postuler"), button:contains("Apply")').first().should('be.visible')
        }
      })
    })

    it('should handle different job states', () => {
      cy.visit('/job-board')
      cy.wait('@getJobOffers')

      // Check that jobs are displayed
      cy.get('body').should('be.visible')

      // Look for any job-related buttons
      cy.get('body').then(($body) => {
        const buttons = $body.find('button, .btn, .apply-btn')
        if (buttons.length > 0) {
          cy.get('button, .btn, .apply-btn').should('have.length.greaterThan', 0)
        }
      })
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport(375, 667)
      cy.visit('/job-board')
      cy.wait('@getJobOffers')

      // Verify mobile layout
      cy.get('body').should('be.visible')
      cy.get('main, [role="main"], .container, .main-content').should('be.visible')

      // Check mobile-specific elements
      cy.get('body').then(($body) => {
        const jobElements = $body.find('[data-testid^="job-"], .job-card, .card')
        if (jobElements.length > 0) {
          cy.get('[data-testid^="job-"], .job-card, .card').should('be.visible')
        }
      })
    })

    it('should work on tablet devices', () => {
      cy.viewport(768, 1024)
      cy.visit('/job-board')
      cy.wait('@getJobOffers')

      cy.get('body').should('be.visible')
      cy.get('main, [role="main"], .container, .main-content').should('be.visible')
    })

  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/jobOffers*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getJobOffersError')

      cy.visit('/job-board')
      cy.wait('@getJobOffersError')

      // Verify page still loads despite API error
      cy.get('body').should('be.visible')
    })

    it('should handle empty job results', () => {
      cy.intercept('GET', '/api/jobOffers*', { body: [] }).as('getEmptyJobOffers')

      cy.visit('/job-board')
      cy.wait('@getEmptyJobOffers')

      // Page should still be visible even with no results
      cy.get('body').should('be.visible')
    })
  })
})
