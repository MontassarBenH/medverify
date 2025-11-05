/// <reference types="cypress" />

describe('Statusänderung – Prüfer', () => {
  it('setzt Status auf GUELTIG', () => {
    const patient = `Pruef Fall ${Date.now()}`;
    cy.request('POST', 'http://localhost:4000/dev/seed');

    // === APO anlegen ===
    cy.intercept('POST', 'http://localhost:4000/auth/login').as('loginApo');
    cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('listApo');

    cy.visit('/');
    cy.get('input[placeholder="E-Mail"]').clear().type('apo@demo.local');
    cy.get('input[placeholder="Passwort"]').clear().type('password123');
    cy.contains('button', 'Einloggen').click();

    cy.wait('@loginApo').its('response.statusCode').should('eq', 200);
    cy.wait('@listApo');

    cy.contains('Angemeldet als APOTHEKER', { timeout: 10000 }).should('be.visible');
    cy.contains('Rezept erfassen', { timeout: 10000 }).should('be.visible');

    cy.get('input[placeholder="Patient"]').type(patient);
    cy.get('input[placeholder="Medikament"]').type('Ibuprofen');
    cy.get('input[placeholder="Menge"]').type('1');
    cy.get('input[placeholder="Ausstellungsdatum"]').type('2025-01-10');

    cy.intercept('POST', 'http://localhost:4000/prescriptions').as('createRx');
    cy.contains('button', 'Einreichen').click();
    cy.wait('@createRx').its('response.statusCode').should('eq', 201);

    // === PRÜFER einloggen ===
    cy.intercept('POST', 'http://localhost:4000/auth/login').as('loginPruefer');
    cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('listPruefer');

    cy.visit('/');
    cy.get('input[placeholder="E-Mail"]').clear().type('pruefer@demo.local');
    cy.get('input[placeholder="Passwort"]').clear().type('password123');
    cy.contains('button', 'Einloggen').click();

    cy.wait('@loginPruefer').its('response.statusCode').should('eq', 200);
    cy.wait('@listPruefer');

    // Filter auf PRUEFEN -> Reload abwarten
    cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('listAfterFilter');
    cy.get('[data-testid="status-filter"]').select('PRUEFEN');
    cy.wait('@listAfterFilter');

    cy.contains(patient, { timeout: 30000 }).should('exist');

    cy.intercept('PATCH', /\/prescriptions\/\d+\/status$/).as('patchStatus');
    cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('listReloadAfterPatch');

    // In der Zeile auf GUELTIG klicken
    cy.contains(patient)
      .parents('li, tr, [data-testid="rx-row"]')
      .first()
      .within(() => {
        cy.contains(/^GUELTIG$/).should('be.visible').click();
      });

    // Erst auf PATCH warten …
    cy.wait('@patchStatus').its('response.statusCode').should('eq', 200);
    cy.wait('@listReloadAfterPatch');

    // In PRUEFEN nicht mehr vorhanden
    cy.contains('li, tr, [data-testid="rx-row"]', patient).should('not.exist');

    // In ALLE prüfen
    cy.intercept('GET', 'http://localhost:4000/prescriptions*').as('listAll');
    cy.get('[data-testid="status-filter"]').select('ALLE');
    cy.wait('@listAll');

    cy.contains('li, tr, [data-testid="rx-row"]', patient, { timeout: 15000 })
      .should('be.visible')
      .within(() => {
        cy.get('[data-testid^="status-"]').should('contain.text', 'GUELTIG');
      });
  });
});
