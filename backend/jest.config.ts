import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'junit', outputName: 'jest-results.xml' }],
  ],
};
export default config;
