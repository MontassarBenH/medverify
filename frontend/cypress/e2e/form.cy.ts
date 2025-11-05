/// <reference types="cypress" />

describe('Formularvalidierung', () => {
  it('zeigt Validierungswarnung bei fehlender Dosierung', () => {
    cy.seed();

    // Intercepts VOR Login/Navigation setzen, damit @list sicher gefangen wird
    cy.intercept('POST', 'http://localhost:4000/auth/login').as('login');
    cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('list');

    cy.visit('/');
    cy.get('input[placeholder="E-Mail"]').clear().type('apo@demo.local');
    cy.get('input[placeholder="Passwort"]').clear().type('password123');
    cy.contains('button', 'Einloggen').click();

    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.wait('@list'); // Erstes Laden gesichert

    const patient = `Erika ${Date.now()}`;
    cy.get('input[placeholder="Patient"]').should('be.visible').clear().type(patient);
    cy.get('input[placeholder="Medikament"]').clear().type('Ibuprofen');
    cy.get('input[placeholder="Menge"]').clear().type('1'); // Menge gesetzt
    cy.get('input[placeholder="Ausstellungsdatum"]').clear().type('2025-01-10');

    // Dosierung fehlt -> Warnung erwartet
    cy.contains('button', 'Einreichen').click();

    cy.get('[data-testid="plausi-msg"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Warnung');
  });
});
