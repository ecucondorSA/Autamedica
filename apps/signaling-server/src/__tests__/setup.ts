/**
 * Vitest Setup File
 * Runs before all tests
 */

// Load environment variables for testing
import 'dotenv/config';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: () => {}, // Silent during tests
  debug: () => {},
  info: () => {},
  warn: console.warn, // Keep warnings
  error: console.error, // Keep errors
};
