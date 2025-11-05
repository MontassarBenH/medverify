/// <reference types="cypress" />

it("login apo", () => {
  cy.request("POST", "http://localhost:4000/dev/seed");

  cy.visit("/");

  cy.get('input[placeholder="E-Mail"]').should("be.visible").clear().type("apo@demo.local");
  cy.get('input[placeholder="Passwort"]').should("be.visible").clear().type("password123");

  cy.intercept("POST", "http://localhost:4000/auth/login").as("login");
  cy.contains("button", "Einloggen").should("be.enabled").click();
  cy.wait("@login").its("response.statusCode").should("eq", 200);

  // Warte auf Dashboard-Request, dann auf sichtbare Elemente
  cy.intercept("GET", "http://localhost:4000/prescriptions*").as("list");
  cy.wait("@list");
  cy.contains("Dashboard").should("be.visible");
});
