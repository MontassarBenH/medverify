/// <reference types="cypress" />

describe('Formular-Grenzwerte – quantity', () => {
  beforeEach(() => {
    cy.seed();
    cy.loginAs('apo@demo.local');
  });

  const fillCore = (q: string) => {
    cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(`Qty ${Date.now()}`);
    cy.get('input[placeholder="Medikament"]').clear().type('Ibuprofen');
    cy.get('input[placeholder="Menge"]').clear().type(q);
    cy.get('input[placeholder="Ausstellungsdatum"]').clear().type('2025-01-10');
  };

  it('quantity: 0 -> Fehler (Grenzwert)', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore('0');
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create');
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'Fehler').and('contain.text', 'quantity');
  });

  it('quantity: negativ -> Fehler', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore('-3');
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create');
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'quantity');
  });

  it('quantity: 1 -> OK (kleinstes gültiges)', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore('1');
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="plausi-msg"]').should('not.contain.text', 'quantity');
  });
});
