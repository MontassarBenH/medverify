import { defineConfig } from 'cypress';
import cypressMochawesomeReporter from 'cypress-mochawesome-reporter/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    pageLoadTimeout: 60000,
    retries: { runMode: 2, openMode: 0 },

    setupNodeEvents(on, config) {
      cypressMochawesomeReporter(on);
      return config;
    },

    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'cypress-mochawesome-reporter, mocha-junit-reporter',

      // JUnit-XML für Xray
      mochaJunitReporterReporterOptions: {
        mochaFile: 'cypress/results/results-[hash].xml',
        toConsole: false,
        useFullSuiteTitle: true,
        suiteTitleSeparatedBy: ' > ',
        testCaseSwitchClassnameAndName: false,
        rootSuiteTitle: 'Cypress Tests',
      },

      cypressMochawesomeReporterReporterOptions: {
        reportDir: 'cypress/reports',
        reportFilename: 'medverify-cypress-report',
        overwrite: false,
        html: true,
        json: true,
        charts: true,
        embeddedScreenshots: true,
        inlineAssets: true, 
      },
    },

    video: true,
    screenshotOnRunFailure: true,
  },
});
