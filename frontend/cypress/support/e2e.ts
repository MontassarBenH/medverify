/// <reference types="cypress" />

const API = Cypress.env('API_URL') || 'http://localhost:4000';

Cypress.Commands.add('seed', () => {
  cy.request('POST', `${API}/dev/seed`);
});

Cypress.Commands.add('loginAs', (email: string, password = 'password123') => {
  // Intercepts VOR Aktionen setzen
  cy.intercept('POST', `${API}/auth/login`).as('login');
  cy.intercept('GET',  `${API}/prescriptions*`).as('list');

  cy.visit('/');

  cy.get('input[placeholder="E-Mail"]').should('be.visible').clear().type(email);
  cy.get('input[placeholder="Passwort"]').should('be.visible').clear().type(password);
  cy.contains('button', 'Einloggen').should('be.enabled').click();

  cy.wait('@login').its('response.statusCode').should('eq', 200);
  cy.wait('@list');
});

Cypress.Commands.add('waitForPrescriptions', () => {
  cy.intercept('GET', `${API}/prescriptions*`).as('listReload');
  cy.wait('@listReload');
});


Cypress.Commands.add('clearDateInput', (selector: string) => {
  cy.get(selector).then(($el) => {
    const input = $el[0] as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      seed(): Chainable<void>;
      loginAs(email: string, password?: string): Chainable<void>;
      waitForPrescriptions(): Chainable<void>;
      clearDateInput(selector: string): Chainable<void>;
    }
  }
}

export {};
