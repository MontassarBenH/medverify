/// <reference types="cypress" />

describe('Formular-Grenzwerte – dosage (Warnung)', () => {
  beforeEach(() => {
    cy.seed();
    cy.loginAs('apo@demo.local');
  });

  const fillBase = () => {
    cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(`Warn ${Date.now()}`);
    cy.get('input[placeholder="Medikament"]').clear().type('Ibuprofen');
    cy.get('input[placeholder="Menge"]').clear().type('1');
    cy.get('input[placeholder="Ausstellungsdatum"]').clear().type('2025-01-10');
  };

  it('dosage: leer -> zeigt Warnung, speichert trotzdem', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillBase();
    cy.get('input[placeholder="Dosierung (z.B. 500mg)"]').clear();
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'Warnung');
  });

  it('dosage: gesetzt -> keine Warnung', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillBase();
    cy.get('input[placeholder="Dosierung (z.B. 500mg)"]').clear().type('400mg');
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 201);
    // Wenn keine Warnung erwartet wird, darf das Element gar nicht existieren
    cy.get('[data-testid="plausi-msg"]').should('not.exist');
  });
});
