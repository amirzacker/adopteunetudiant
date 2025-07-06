describe("Messenger page tests", () => {
  beforeEach(() => {
    cy.visit("/messenger");
  });

  it("Loads the Messenger page", () => {
    cy.contains("Messenger");
  });

  it("Logs in to the Messenger page", () => {
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("testpassword");
    cy.get('button[type="submit"]').click();
    cy.contains("Welcome, testuser");
  });

  it("Displays the conversation list", () => {
    cy.get(".conversation-list").should("be.visible");
  });

  it("Selects a conversation from the list", () => {
    cy.get(".conversation-list").find("li").first().click();
    cy.get(".conversation-list")
      .find("li")
      .first()
      .should("have.class", "active");
  });

  it("Displays the selected conversation messages", () => {
    cy.get(".conversation-list").find("li").first().click();
    cy.get(".message-list").should("be.visible");
  });

  it("Sends a message in the selected conversation", () => {
    cy.get(".conversation-list").find("li").first().click();
    cy.get(".message-input").type("Hello, cypress testing!");
    cy.get(".send-message-btn").click();
    cy.get(".message-list")
      .find("li")
      .last()
      .contains("Hello, cypress testing!");
  });
});
