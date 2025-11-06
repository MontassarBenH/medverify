/// <reference types="cypress" />

describe('Formular-Grenzwerte – patientName', () => {
  beforeEach(() => {
    cy.seed();
    cy.loginAs('apo@demo.local');
  });

  const fillCore = (name: string) => {
    cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(name);
    cy.get('input[placeholder="Medikament"]').clear().type('Ibuprofen');
    cy.get('input[placeholder="Menge"]').clear().type('1');
    cy.get('input[placeholder="Ausstellungsdatum"]').clear().type('2025-01-10');
  };

  it('patientName: 2 Zeichen -> Fehler (Grenzwert - 1)', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore('Al'); 
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 400);
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'Fehler').and('contain.text', 'patientName');
  });

  it('patientName: 3 Zeichen -> OK (Grenzwert)', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore(`Ali-${Date.now()}`); // 3+
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="plausi-msg"]').should('not.contain.text', 'patientName');
  });
});
