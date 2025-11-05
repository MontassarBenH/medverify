import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
  },
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/results/results-[hash].xml",
    toConsole: true,
  },
});
