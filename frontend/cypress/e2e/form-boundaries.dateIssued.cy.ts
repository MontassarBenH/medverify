/// <reference types="cypress" />

describe('Formular-Grenzwerte – dateIssued', () => {
  beforeEach(() => {
    // Fixierte Zeit verhindert Flakiness (heute/morgen)
    const fixed = new Date('2025-01-10T10:00:00Z').getTime();
    cy.clock(fixed, ['Date']);
    cy.seed();
    cy.loginAs('apo@demo.local');
  });

  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  const fillCore = (d?: string | null) => {
    cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(`DateT ${Date.now()}`);
    cy.get('input[placeholder="Medikament"]').clear().type('Ibuprofen');
    cy.get('input[placeholder="Menge"]').clear().type('1');

    if (typeof d === 'string') {
      cy.get('input[placeholder="Ausstellungsdatum"]').clear().type(d);
    } else {
      // LEER setzen via Custom Command (ohne cy.type)
      cy.clearDateInput('input[placeholder="Ausstellungsdatum"]');
    }
  };

  it('dateIssued: heute -> OK (Grenzwert)', () => {
    const today = ymd(new Date());
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore(today);
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="plausi-msg"]').should('not.contain.text', 'dateIssued');
  });

  it('dateIssued: morgen -> Fehler (Zukunft)', () => {
    const tomorrow = ymd(new Date(Date.now() + 24 * 60 * 60 * 1000));
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore(tomorrow);
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create');
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'dateIssued');
  });

  it('dateIssued: leer -> Fehler (Pflichtfeld)', () => {
    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('create');
    fillCore(null); // leer
    cy.contains('button', 'Einreichen').click();
    cy.wait('@create');
    cy.get('[data-testid="plausi-msg"]').should('contain.text', 'dateIssued');
  });
});
