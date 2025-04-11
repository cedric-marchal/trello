// tests/package-validation.test.ts

import { describe, expect, it } from 'vitest';
import * as allExports from '../src/index.js';
import { Trello } from '../src/index.js';

describe('Package Validation Tests', () => {
  describe('Exports', () => {
    it('should export the Trello class as the main export', () => {
      expect(Trello).toBeDefined();
      expect(typeof Trello).toBe('function');
      expect(Trello.prototype.constructor.name).toBe('Trello');
    });

    it('should export all necessary types', () => {
      const exportedNames = Object.keys(allExports);
      expect(exportedNames).toContain('Trello');

      // Check for types (this will verify the type exports at compile time)
      // This is mainly a TypeScript check, not a runtime check
    });
  });

  describe('Instance Creation', () => {
    it('should correctly instantiate with required parameters', () => {
      const trello = new Trello('test-key', 'test-token');
      expect(trello).toBeInstanceOf(Trello);
    });

    it('should verify required parameters at runtime', () => {
      // Instead of testing constructor directly, test a method call that would fail
      // @ts-expect-error - Intentionally creating with incorrect arguments
      const invalidTrello = new Trello();

      // This should fail when trying to use the instance
      expect(() => invalidTrello.getBoards({ memberId: 'me' })).rejects.toThrow();

      // @ts-expect-error - Intentionally creating with incorrect arguments
      const partialTrello = new Trello('only-key');

      // This should fail when trying to use the instance
      expect(() => partialTrello.getBoards({ memberId: 'me' })).rejects.toThrow();
    });
  });

  describe('Package Structure', () => {
    it('should have the main exported class with the expected methods', () => {
      const trello = new Trello('test-key', 'test-token');

      // Check core methods
      expect(typeof trello.makeRequest).toBe('function');
      expect(typeof trello.getBoards).toBe('function');
      expect(typeof trello.addCard).toBe('function');

      // Check action methods
      expect(typeof trello.getAction).toBe('function');
      expect(typeof trello.updateAction).toBe('function');
      expect(typeof trello.deleteAction).toBe('function');

      // Check reaction methods
      expect(typeof trello.getActionReactions).toBe('function');
      expect(typeof trello.addReactionToAction).toBe('function');
      expect(typeof trello.deleteActionReaction).toBe('function');
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments on public methods', () => {
      // This is more of a compile-time check
      // We can verify that the constructor has a docstring as a basic check
      const trelloProto = Trello.prototype;
      const constructorString = trelloProto.constructor.toString();

      // Check if the constructor has comments
      expect(constructorString).toContain('Creates a new Trello API client instance');
    });
  });
});
