// cypress/e2e/errors.cy.ts
it("blockt Menge <= 0", () => {
  // Login
  cy.request("POST", "http://localhost:4000/dev/seed");
  cy.visit("/");
  cy.get('input[placeholder="E-Mail"]').clear().type("apo@demo.local");
  cy.get('input[placeholder="Passwort"]').clear().type("password123");
  cy.contains("button", "Einloggen").click();

  // Formular ausfüllen (Menge = 0 => Fehler)
  const patient = `Max ${Date.now()}`;
  cy.contains("Rezept erfassen", { timeout: 10000 }).should("be.visible");
  cy.get('input[placeholder="Patient"]').should("be.visible").type(patient);
  cy.get('input[placeholder="Medikament"]').type("Amoxicillin");
  cy.get('input[placeholder="Menge"]').type("0");
  cy.get('input[placeholder="Ausstellungsdatum"]').type("2025-01-10");

  // Abschicken
  cy.contains("button", "Einreichen").click();

  // Erwartung: Fehlermeldung sichtbar (keine Netz-Waits nötig)
  cy.get('[data-testid="plausi-msg"]', { timeout: 10000 })
    .should("be.visible")
    .and("contain.text", "Fehler");
});
