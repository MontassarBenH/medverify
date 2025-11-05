import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
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
    },
    video: false,
    screenshotOnRunFailure: true,
  },
});