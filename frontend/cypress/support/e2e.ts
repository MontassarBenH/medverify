/// <reference types="cypress" />

Cypress.Commands.add('seed', () => {
  cy.request('POST', 'http://localhost:4000/dev/seed');
});

Cypress.Commands.add('loginAs', (email: string, password = 'password123') => {
  // Intercepts VOR Aktionen setzen
  cy.intercept('POST', 'http://localhost:4000/auth/login').as('login');
  cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('list');

  cy.visit('/');

  cy.get('input[placeholder="E-Mail"]').should('be.visible').clear().type(email);
  cy.get('input[placeholder="Passwort"]').should('be.visible').clear().type(password);
  cy.contains('button', 'Einloggen').should('be.enabled').click();

  cy.wait('@login').its('response.statusCode').should('eq', 200);
  cy.wait('@list'); // erstes Laden des Dashboards/Liste
});

Cypress.Commands.add('waitForPrescriptions', () => {
  // Sichert, dass bei späteren Reloads/Filterwechseln gewartet wird
  cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('listReload');
  cy.wait('@listReload');
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      seed(): Chainable<void>;
      loginAs(email: string, password?: string): Chainable<void>;
      waitForPrescriptions(): Chainable<void>;
    }
  }
}

export {};
