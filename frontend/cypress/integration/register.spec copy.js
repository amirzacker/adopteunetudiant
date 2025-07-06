describe('Register', () => {
  it('devrait afficher une erreur si nom trop court', () => {
    cy.visit('/register')
    cy.get('#name').type('T')
    cy.get('button[type=submit]').click()
    cy.get('div.alert.alert-warning').should('have.text', 'Votre nom doit comporter au moins 2 caractères')
    cy.url().should('eq', Cypress.config().baseUrl + '/register')
  })

  it('devrait afficher une erreur si email invalide', () => {
    cy.visit('/register')
    cy.get('#name').type('TestName')
    cy.get('#email').type('test')
    cy.get('button[type=submit]').click()
    cy.get('div.alert.alert-warning').should('have.text', 'Entrez un email valide')
    cy.url().should('eq', Cypress.config().baseUrl + '/register')
  })

  it('devrait afficher une erreur si mot de passe trop court', () => {
    cy.visit('/register')
    cy.get('#name').type('TestName')
    cy.get('#email').type('test@test.fr')
    cy.get('#password').type('1234567')
    cy.get('button[type=submit]').click()
    cy.get('div.alert.alert-warning').should('have.text', 'Votre mot de passe doit comporter au moins 8 caractères')
    cy.url().should('eq', Cypress.config().baseUrl + '/register')
  })

  it('devrait afficher une erreur si pays invalide', () => {
    cy.visit('/register')
    cy.get('#name').type('TestName')
    cy.get('#email').type('test@test.fr')
    cy.get('#password').type('12345678')
    cy.get('button[type=submit]').click()
    cy.get('div.alert.alert-warning').should('have.text', 'Sélectionnez votre pays')
    cy.url().should('eq', Cypress.config().baseUrl + '/register')
  })

  it('devrait rediriger vers la Home lorsque le formulaire ets correctement rempli', () => {
    cy.visit('/register')
    cy.get('#name').type('TestName')
    cy.get('#email').type('test@test.fr')
    cy.get('#password').type('12345678')
    cy.get('#country').select('FRANCE')
    cy.get('button[type=submit]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
