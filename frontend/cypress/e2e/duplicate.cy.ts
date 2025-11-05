/// <reference types="cypress" />

it("blockt Duplikat am selben Tag", () => {
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

  const patient = `Dup ${Date.now()}`;
  const fill = () => {
    cy.get('input[placeholder="Patient"]').clear().type(patient);
    cy.get('input[placeholder="Medikament"]').clear().type("Ibuprofen");
    cy.get('input[placeholder="Menge"]').clear().type("1");
    cy.get('input[placeholder="Ausstellungsdatum"]').clear().type("2025-01-10");
  };

  // 1. Einreichung
  fill();
  cy.contains("button", "Einreichen").click();
  cy.get('[data-testid="plausi-msg"]').should("not.contain.text", "mögliches Duplikat");

  // 2. Einreichung → Duplikat
  fill();
  cy.contains("button", "Einreichen").click();
  cy.get('[data-testid="plausi-msg"]').should("contain.text", "mögliches Duplikat");
});
