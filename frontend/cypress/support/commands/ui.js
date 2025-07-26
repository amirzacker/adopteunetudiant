// UI interaction custom commands

/**
 * Fill out job application form
 */
Cypress.Commands.add('fillJobApplicationForm', (applicationData = {}) => {
  const defaultData = {
    coverLetter: 'I am very interested in this position and believe I would be a great fit...',
    resumeFile: 'resume.pdf',
    ...applicationData
  }

  cy.get('[data-testid="application-form"]').within(() => {
    if (defaultData.coverLetter) {
      cy.get('textarea[name="coverLetter"]').type(defaultData.coverLetter)
    }
    
    if (defaultData.resumeFile) {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('fake resume content'),
        fileName: defaultData.resumeFile,
        mimeType: 'application/pdf'
      }, { force: true })
    }
  })
})

/**
 * Fill out job creation form
 */
Cypress.Commands.add('fillJobForm', (jobData = {}) => {
  const defaultData = {
    title: 'Frontend Developer',
    description: 'We are looking for a skilled frontend developer...',
    location: 'Paris',
    requirements: 'React, JavaScript, CSS, HTML',
    salary: '35000-45000',
    duration: '6 months',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    ...jobData
  }

  cy.get('[data-testid="job-form"]').within(() => {
    if (defaultData.title) {
      cy.get('input[name="title"]').clear().type(defaultData.title)
    }
    if (defaultData.description) {
      cy.get('textarea[name="description"]').clear().type(defaultData.description)
    }
    if (defaultData.location) {
      cy.get('input[name="location"]').clear().type(defaultData.location)
    }
    if (defaultData.requirements) {
      cy.get('textarea[name="requirements"]').clear().type(defaultData.requirements)
    }
    if (defaultData.salary) {
      cy.get('input[name="salary"]').clear().type(defaultData.salary)
    }
    if (defaultData.duration) {
      cy.get('input[name="duration"]').clear().type(defaultData.duration)
    }
    if (defaultData.startDate) {
      cy.get('input[name="startDate"]').clear().type(defaultData.startDate)
    }
    if (defaultData.endDate) {
      cy.get('input[name="endDate"]').clear().type(defaultData.endDate)
    }
  })
})

/**
 * Search for jobs with filters
 */
Cypress.Commands.add('searchJobs', (searchParams = {}) => {
  const { searchTerm, location, domain, jobType } = searchParams

  if (searchTerm) {
    cy.get('input[placeholder*="rechercher"]').clear().type(searchTerm)
  }
  
  if (location) {
    cy.get('input[placeholder*="ville"]').clear().type(location)
  }
  
  if (domain) {
    cy.get('select').first().select(domain)
  }
  
  if (jobType) {
    cy.get('select').eq(1).select(jobType)
  }
})

/**
 * Clear all job search filters
 */
Cypress.Commands.add('clearJobFilters', () => {
  cy.contains('Effacer les filtres').click()
})

/**
 * Navigate through pagination
 */
Cypress.Commands.add('goToPage', (pageNumber) => {
  cy.get(`button[aria-label="Go to page ${pageNumber}"]`).click()
})

/**
 * Open job detail modal
 */
Cypress.Commands.add('openJobDetail', (jobIndex = 0) => {
  cy.get('[data-testid^="job-"]').eq(jobIndex).click()
  cy.get('[data-testid="job-detail-modal"]').should('be.visible')
})

/**
 * Close modal
 */
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-testid="close-modal"]').click()
})

/**
 * Check form validation errors
 */
Cypress.Commands.add('shouldHaveValidationError', (message = 'Ce champ est requis') => {
  cy.contains(message).should('be.visible')
})

/**
 * Check success message
 */
Cypress.Commands.add('shouldHaveSuccessMessage', (message) => {
  cy.contains(message).should('be.visible')
})

/**
 * Check error message
 */
Cypress.Commands.add('shouldHaveErrorMessage', (message) => {
  cy.contains(message).should('be.visible')
})

/**
 * Navigate using sidebar in dashboard
 */
Cypress.Commands.add('navigateInDashboard', (section) => {
  const sectionMap = {
    home: '.home-icon',
    jobs: '.jobs-icon',
    applications: '.applications-icon',
    messages: '.messages-icon',
    profile: '.profile-icon'
  }
  
  const selector = sectionMap[section]
  if (selector) {
    cy.get(selector).click()
  }
})

/**
 * Check responsive design
 */
Cypress.Commands.add('checkResponsive', (viewports = ['iphone-x', 'ipad-2', 'macbook-15']) => {
  viewports.forEach(viewport => {
    cy.viewport(viewport)
    cy.get('body').should('be.visible')
    // Add specific responsive checks here
  })
})
