describe("RegisterCompany component", () => {
  beforeEach(() => {
    cy.visit("/register-company");
  });

  it("should have correct page title", () => {
    cy.title().should("equal", "RegisterCompany");
  });

  it("should display an error message when email is not provided", () => {
    cy.get("[name='name']").type("Test Company");
    cy.get("[name='city']").type("Test City");
    cy.get("[name='desc']").type("Test Description");
    cy.get("[name='password']").type("TestPassword1!");
    cy.get("[name='cpassword']").type("TestPassword1!");
    cy.get("[name='acceptTerms']").check();
    cy.get("button").click();
    cy.get("[data-testid='error-email']").should("exist");
  });

  it("should display an error message when email is invalid", () => {
    cy.get("[name='name']").type("Test Company");
    cy.get("[name='email']").type("invalid.email");
    cy.get("[name='city']").type("Test City");
    cy.get("[name='desc']").type("Test Description");
    cy.get("[name='password']").type("TestPassword1!");
    cy.get("[name='cpassword']").type("TestPassword1!");
    cy.get("[name='acceptTerms']").check();
    cy.get("button").click();
    cy.get("[data-testid='error-email']").should("exist");
  });

  it("should display an error message when password is less than 10 characters", () => {
    cy.get("#password").type("short");
    cy.get("#submit").click();
    cy.get("#error-message")
      .should("be.visible")
      .and("have.text", "Password must be at least 10 characters");
  });
  it("submits the form successfully with valid inputs", () => {
    cy.get("input[name='email']").type("example@email.com");
    cy.get("input[name='password']").type("password123");
    cy.get("form").submit();
    // Check for successful submission by asserting that a success message appears on the page or by checking for redirect to the expected page.
  });
});
