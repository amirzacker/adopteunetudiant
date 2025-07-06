describe('Students page', () => {
  beforeEach(() => {
    cy.visit('/students');
  });

  it('renders the page', () => {
    cy.get('#profiletudiants').should('be.visible');
  });

  it('displays the student list', () => {
    cy.get('.rowcards').find('.student-card').should('exist');
  });

  it('filters the student list based on domain selection', () => {
    cy.get('.form select').select('Computer Science');
    cy.get('.rowcards').find('.student-card').should('have.length.greaterThan', 0);
  });

  it('filters the student list based on domain search', () => {
    cy.get('.form input').type('Computer Science');
    cy.get('.rowcards').find('.student-card').should('have.length.greaterThan', 0);
  });

  it('paginates the student list', () => {
    cy.get('.MuiPagination-root').should('exist');
    cy.get('.MuiPagination-root').find('.MuiPaginationItem-page').eq(2).click();
    cy.get('.rowcards').find('.student-card').should('exist');
  });
});
