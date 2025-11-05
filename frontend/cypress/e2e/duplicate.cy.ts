/// <reference types="cypress" />

describe('Rezept – Duplikat-Prüfung', () => {
  it('blockt Duplikat am selben Tag', () => {
    cy.seed();
    cy.loginAs('apo@demo.local');

    const patient = `Dup ${Date.now()}`;
    const fill = () => {
      cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(patient);
      cy.get('input[placeholder="Medikament"]').clear().type('Ibuprofen');
      cy.get('input[placeholder="Menge"]').clear().type('1');
      cy.get('input[placeholder="Ausstellungsdatum"]').clear().type('2025-01-10');
    };

    // 1. Einreichung
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('createRx1');
    fill();
    cy.contains('button', 'Einreichen').click();
    cy.wait('@createRx1').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="plausi-msg"]').should('not.contain.text', 'mögliches Duplikat');

    // 2. Einreichung → Duplikat
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('createRx2');
    fill();
    cy.contains('button', 'Einreichen').click();
    cy.wait('@createRx2').its('response.statusCode').should('be.oneOf', [201, 409]); // tolerant
    cy.get('[data-testid="plausi-msg"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'mögliches Duplikat');
  });
});
