import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    pageLoadTimeout: 60000,
    retries: { runMode: 2, openMode: 0 }, 
    setupNodeEvents(on, config) {

    },
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/results/results-[hash].xml',
      toConsole: false,
      useFullSuiteTitle: true,
      suiteTitleSeparatedBy: ' > ',
      testCaseSwitchClassnameAndName: false,
      rootSuiteTitle: 'Cypress Tests',
    },
    video: false,
    screenshotOnRunFailure: true,
  },
});
