/// <reference types="cypress" />

describe('Login – Apotheker', () => {
  it('führt erfolgreichen Login durch', () => {
    cy.seed();
    cy.loginAs('apo@demo.local');

    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });
});
