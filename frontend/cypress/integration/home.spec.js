describe('Home', () => {
  it('devrait avoir des liens cliquables', () => {
    cy.visit('/')
    cy.contains('Users')
    cy.contains('Counter')
    cy.contains('Inscrivez-vous').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/register')
  })
})
