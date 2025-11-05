import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      apiUrl: 'http://localhost:4000',
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
      toConsole: true,
      useFullSuiteTitle: true,
      suiteTitleSeparatedBy: ' > ',
      testCaseSwitchClassnameAndName: false,
      rootSuiteTitle: 'Cypress Tests', 
      testsuitesTitle: 'Medverify E2E Tests',
    },
    video: false,
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});