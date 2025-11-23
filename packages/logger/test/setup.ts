/**
 * Jest setup file for shared package tests.
 * Configures global test environment and mocks.
 */

// Mock environment variables to avoid side effects
process.env.NODE_ENV = "development";

// Mock console methods to avoid cluttering test output
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore original console
  Object.assign(console, originalConsole);
});

// Global test timeout
jest.setTimeout(10000);

export {};
