/// <reference types="cypress" />

it("setzt Status auf GUELTIG", () => {
  const patient = `Pruef Fall ${Date.now()}`;
  cy.request("POST", "http://localhost:4000/dev/seed");

  // Als Apotheker anlegen
  cy.visit("/");
  cy.get('input[placeholder="E-Mail"]').clear().type("apo@demo.local");
  cy.get('input[placeholder="Passwort"]').clear().type("password123");
  cy.contains("button", "Einloggen").click();

  cy.contains("Angemeldet als APOTHEKER", { timeout: 10000 }).should("be.visible");
  cy.contains("Rezept erfassen", { timeout: 10000 }).should("be.visible");

  cy.get('input[placeholder="Patient"]').type(patient);
  cy.get('input[placeholder="Medikament"]').type("Ibuprofen");
  cy.get('input[placeholder="Menge"]').type("1");
  cy.get('input[placeholder="Ausstellungsdatum"]').type("2025-01-10");

  cy.intercept("POST", "http://localhost:4000/prescriptions").as("createRx");
  cy.contains("button", "Einreichen").click();
  cy.wait("@createRx").its("response.statusCode").should("eq", 201);

  // Als Prüfer
  cy.visit("/");
  cy.get('input[placeholder="E-Mail"]').clear().type("pruefer@demo.local");
  cy.get('input[placeholder="Passwort"]').clear().type("password123");
  cy.contains("button", "Einloggen").click();

  cy.contains("Angemeldet als PRUEFER", { timeout: 10000 }).should("be.visible");

  cy.intercept("GET", "http://localhost:4000/prescriptions*").as("list");
  cy.get('[data-testid="status-filter"]').select("PRUEFEN");
  cy.wait("@list");

  cy.intercept("PATCH", /\/prescriptions\/\d+\/status$/).as("patchStatus");
  cy.contains("li", patient).within(() => {
    cy.contains("GUELTIG").click();
  });
  cy.wait("@patchStatus").its("response.statusCode").should("eq", 200);

  cy.wait("@list");
  cy.contains("li", patient).should("not.exist");

  cy.get('[data-testid="status-filter"]').select("ALLE");
  cy.wait("@list");
  cy.contains("li", patient).find('[data-testid^="status-"]').should("contain.text", "GUELTIG");
});
