/// <reference types="cypress" />

describe('Formular-Grenzwerte – medication', () => {
  beforeEach(() => {
    cy.seed();
    cy.loginAs('apo@demo.local');
  });

  const fillCore = () => {
    cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(`MedT ${Date.now()}`);
    cy.get('input[placeholder="Menge"]').clear().type('1');
    cy.get('input[placeholder="Ausstellungsdatum"]').clear().type('2025-01-10');
  };

  it('medication: leer -> Fehler (Pflichtfeld)', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore();
    cy.get('input[placeholder="Medikament"]').clear(); 
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 400);
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'Fehler').and('contain.text', 'medication');
  });
});
