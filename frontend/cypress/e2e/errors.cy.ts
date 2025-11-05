/// <reference types="cypress" />

it("blockt Menge <= 0", () => {
  cy.request("POST", "http://localhost:4000/dev/seed");

  cy.visit("/");
  cy.get('input[placeholder="E-Mail"]').clear().type("apo@demo.local");
  cy.get('input[placeholder="Passwort"]').clear().type("password123");
  cy.intercept("POST", "http://localhost:4000/auth/login").as("login");
  cy.contains("button", "Einloggen").click();
  cy.wait("@login").its("response.statusCode").should("eq", 200);

  cy.intercept("GET", "http://localhost:4000/prescriptions*").as("list");
  cy.wait("@list");
  cy.contains("Rezept erfassen").should("be.visible");
  cy.get('input[placeholder="Patient"]', { timeout: 10000 }).should("be.visible");

  const patient = `Max ${Date.now()}`;
  cy.get('input[placeholder="Patient"]').type(patient);
  cy.get('input[placeholder="Medikament"]').type("Amoxicillin");
  cy.get('input[placeholder="Menge"]').type("0");
  cy.get('input[placeholder="Ausstellungsdatum"]').type("2025-01-10");

  cy.intercept("POST", "http://localhost:4000/prescriptions").as("create");
  cy.contains("button", "Einreichen").click();
  cy.wait("@create").its("response.statusCode").should("eq", 201);

  cy.get('[data-testid="plausi-msg"]').should("contain.text", "Fehler");
});
