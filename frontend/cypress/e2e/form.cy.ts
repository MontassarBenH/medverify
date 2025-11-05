/// <reference types="cypress" />

it("zeigt Validierungswarnung bei fehlender Dosierung", () => {
  cy.request("POST", "http://localhost:4000/dev/seed");

  // Login Apotheker
  cy.visit("/");
  cy.get('input[placeholder="E-Mail"]').clear().type("apo@demo.local");
  cy.get('input[placeholder="Passwort"]').clear().type("password123");
  cy.intercept("POST", "http://localhost:4000/auth/login").as("login");
  cy.contains("button", "Einloggen").click();
  cy.wait("@login").its("response.statusCode").should("eq", 200);

  // Auf Formular warten
  cy.intercept("GET", "http://localhost:4000/prescriptions*").as("list");
  cy.wait("@list");
  cy.contains("Rezept erfassen").should("be.visible");
  cy.get('input[placeholder="Patient"]', { timeout: 10000 }).should("be.visible");

  const patient = `Erika ${Date.now()}`;
  cy.get('input[placeholder="Patient"]').clear().type(patient);
  cy.get('input[placeholder="Medikament"]').clear().type("Ibuprofen");
  cy.get('input[placeholder="Menge"]').clear().type("1");
  cy.get('input[placeholder="Ausstellungsdatum"]').clear().type("2025-01-10");

  cy.contains("button", "Einreichen").click();
  cy.get('[data-testid="plausi-msg"]').should("contain.text", "Warnung");
});
