describe("Test Register Student form", () => {
  beforeEach(() => {
    cy.visit("/register-student");
  });

  it("displays an error message if the form is submitted with missing fields", () => {
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="firstname-error"]').should("exist");
    cy.get('[data-cy="lastname-error"]').should("exist");
    cy.get('[data-cy="email-error"]').should("exist");
    cy.get('[data-cy="date-error"]').should("exist");
    cy.get('[data-cy="city-error"]').should("exist");
    cy.get('[data-cy="startDate-error"]').should("exist");
    cy.get('[data-cy="endDate-error"]').should("exist");
    cy.get('[data-cy="searchType-error"]').should("exist");
    cy.get('[data-cy="domain-error"]').should("exist");
    cy.get('[data-cy="desc-error"]').should("exist");
    cy.get('[data-cy="password-error"]').should("exist");
    cy.get('[data-cy="cpassword-error"]').should("exist");
    cy.get('[data-cy="acceptTerms-error"]').should("exist");
  });

  it("displays an error message if the email already exists", () => {
    cy.get('[data-cy="firstname"]').type("John");
    cy.get('[data-cy="lastname"]').type("Doe");
    cy.get('[data-cy="email"]').type("john.doe@example.com");
    cy.get('[data-cy="date"]').type("2000-01-01");
    cy.get('[data-cy="city"]').type("New York");
    cy.get('[data-cy="startDate"]').type("2023-01-01");
    cy.get('[data-cy="endDate"]').type("2023-01-31");
    cy.get('[data-cy="searchType"]').select("Internship");
    cy.get('[data-cy="domain"]').select("Technology");
    cy.get('[data-cy="desc"]').type(
      "I am looking for an internship opportunity in the technology field."
    );
    cy.get('[data-cy="password"]').type("Password123!");
    cy.get('[data-cy="cpassword"]').type("Password123!");
    cy.get('[data-cy="acceptTerms"]').click();
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="email-error"]').should(
      "contain",
      "Email already exists in the database"
    );
  });

  it("submits the form successfully with valid inputs", () => {
    cy.get('[data-cy="firstname"]').type("Jane");
    cy.get('[data-cy="lastname"]').type("Doe");
    cy.get('[data-cy="email"]').type("jane.doe@example.com");
    cy.get('[data-cy="password"]').type("password123");
    cy.get('[data-cy="submit-button"]').click();
    cy.contains("Successful Submission");
  });
});
