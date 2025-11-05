import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
    defaultCommandTimeout: 10000, 
  },
  reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'spec, mocha-junit-reporter',
      mochaJunitReporterReporterOptions: {
        mochaFile: 'cypress/results/results-[hash].xml',
        toConsole: false,
        outputs: true,
        testCaseSwitchClassnameAndName: false,
        suiteTitleSeparatedBy: ' > ',
        useFullSuiteTitle: true,
      },
    },
});
