describe('Student page', () => {
  it('displays student information correctly', () => {
    cy.visit('/student/:id');

    cy.get('[data-testid="student-name"]').should('contain', 'Student name');
    cy.get('[data-testid="student-age"]').should('contain', 'Student age');
    cy.get('[data-testid="student-email"]').should('contain', 'Student email');
    cy.get('[data-testid="student-start-date"]').should('contain', 'Student start date');
    cy.get('[data-testid="student-end-date"]').should('contain', 'Student end date');
    cy.get('[data-testid="student-domain"]').should('contain', 'Student domain');
  });

  it('sends a notification email when the "start a conversation" button is clicked', () => {
    cy.visit('/student/:id');

    cy.get('[data-testid="start-conversation-button"]').click();

    cy.get('[data-testid="success-message"]').should('contain', 'Notification email sent successfully');
  });
});
