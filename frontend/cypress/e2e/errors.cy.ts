/// <reference types="cypress" />

describe('Rezept – Fehlerprüfungen', () => {
  it('blockt Menge <= 0', () => {
    cy.seed();
    cy.loginAs('apo@demo.local');

    const patient = `Max ${Date.now()}`;
    cy.contains('Rezept erfassen', { timeout: 10000 }).should('be.visible');

    cy.get('input[placeholder="Patient"]').should('be.visible').type(patient);
    cy.get('input[placeholder="Medikament"]').type('Amoxicillin');
    cy.get('input[placeholder="Menge"]').type('0');
    cy.get('input[placeholder="Ausstellungsdatum"]').type('2025-01-10');

    cy.contains('button', 'Einreichen').click();

    cy.get('[data-testid="plausi-msg"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Fehler');
  });
});
