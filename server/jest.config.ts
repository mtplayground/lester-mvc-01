import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.ts'],
  clearMocks: true
};

export default config;
