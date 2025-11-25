/** @type {import('jest').Config} */
export default {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest/presets/default-esm",

  // Set test environment to Node.js
  testEnvironment: "node",

  // Support for ES modules
  extensionsToTreatAsEsm: [".ts"],

  // Module file extensions Jest should recognize
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Directories to search for modules
  moduleDirectories: ["node_modules", "src"],

  // Transform TypeScript files using ts-jest
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          target: "es2022",
          moduleResolution: "node",
        },
      },
    ],
  },

  // Test file patterns
  testMatch: [
    "**/test/**/*.test.(ts|tsx|js)",
    "**/test/**/*.spec.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)",
  ],

  // Ignore setup files when looking for tests
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/test/setup.ts"],

  // Transform workspace packages (don't ignore @realm packages)
  transformIgnorePatterns: [
    "node_modules/(?!(@realm)/)",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/index.ts",
  ],

  // Coverage thresholds (optional)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files (if needed)
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],

  // Module name mapping for path aliases and extension resolution
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    // Map workspace packages to their TypeScript source
    "^@realm/errors$": "<rootDir>/../errors/src/index.ts",
    "^@realm/core$": "<rootDir>/../core/src/index.ts",
  },

  // Clear mocks automatically between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,
};
