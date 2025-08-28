/**
 * Unit tests for the Logging class.
 * Tests core logging functionality, configuration, and error handling.
 */

import { Logging } from "../src/logger/logging.js";
import { Environment } from "../src/types/logger.js";

describe("Logging", () => {
  let logger: Logging;

  beforeEach(() => {
    // Reset singleton for each test
    (Logging as any).instance = null;
    logger = Logging.getLogger();
  });

  afterEach(() => {
    // Clean up
    (Logging as any).instance = null;
  });

  describe("Singleton Pattern", () => {
    /**
     * Test that getLogger always returns the same instance.
     */
    it("should return the same instance on multiple calls", () => {
      const instance1 = Logging.getLogger();
      const instance2 = Logging.getLogger();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(Logging);
    });
  });

  describe("Configuration", () => {
    /**
     * Test logger configuration with valid parameters.
     */
    it("should configure logger with valid parameters", () => {
      const config = {
        environment: Environment.Development,
        enableConsoleLogging: false,
        enableDiscordLogging: false,
      };

      expect(() => logger.configure(config)).not.toThrow();
    });

    /**
     * Test app name setting functionality.
     */
    it("should set and get app name correctly", () => {
      const testAppName = "test-app";

      logger.setAppName(testAppName);
      expect(logger.getAppName()).toBe(testAppName);
    });
  });

  describe("Logging Methods", () => {
    beforeEach(() => {
      logger.configure({
        environment: Environment.Development,
        enableConsoleLogging: false, // Disable to avoid console spam during tests
        enableDiscordLogging: false,
      });
    });

    /**
     * Test debug logging functionality.
     */
    it("should log debug messages", () => {
      const consoleSpy = jest.spyOn(console, "debug").mockImplementation();

      logger.configure({
        enableConsoleLogging: true,
      });

      logger.debug("Test debug message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    /**
     * Test info logging functionality.
     */
    it("should log info messages", () => {
      const consoleSpy = jest.spyOn(console, "info").mockImplementation();

      logger.configure({
        enableConsoleLogging: true,
      });

      logger.info("Test info message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    /**
     * Test warning logging functionality.
     */
    it("should log warning messages", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      logger.configure({
        enableConsoleLogging: true,
      });

      logger.warning("Test warning message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    /**
     * Test error logging functionality.
     */
    it("should log error messages", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      logger.configure({
        enableConsoleLogging: true,
      });

      logger.error("Test error message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    /**
     * Test logging with additional fields.
     */
    it("should handle logging with additional fields", () => {
      const consoleSpy = jest.spyOn(console, "info").mockImplementation();

      logger.configure({
        enableConsoleLogging: true,
      });

      logger.info("Test message with fields", {
        fields: {
          userId: "12345",
          action: "test-action",
        },
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    /**
     * Test logging Error objects.
     */
    it("should handle Error objects in logging", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      logger.configure({
        enableConsoleLogging: true,
      });

      const testError = new Error("Test error");
      logger.error("Error occurred", { error: testError });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
