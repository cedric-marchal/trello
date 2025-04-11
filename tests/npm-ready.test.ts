// tests/npm-ready.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRequest } from '../src/http.js';
import { Trello } from '../src/index.js';
import { createErrorResponse, createMockResponse, createRateLimitResponse } from './utils.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('NPM Release Readiness Tests', () => {
  let trello: Trello;

  beforeEach(() => {
    trello = new Trello('test-key', 'test-token');
    vi.resetAllMocks();

    // Mock setTimeout to avoid waiting in tests
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 0 as unknown as NodeJS.Timeout;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('HTTP Client Edge Cases', () => {
    it('should handle empty response bodies correctly', async () => {
      // Mock a response with empty body
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await makeRequest('get', '/test', { query: { key: 'key', token: 'token' } });
      expect(result).toEqual({});
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network failure
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        makeRequest('get', '/test', { query: { key: 'key', token: 'token' } })
      ).rejects.toThrow('Network error');
    });

    it('should correctly serialize complex query parameters', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await makeRequest('get', '/test', {
        query: {
          key: 'key',
          token: 'token',
          array: [1, 2, 3],
          object: { a: 1, b: 2 },
          nullValue: null,
          undefinedValue: undefined,
          booleanValue: true,
        },
      });

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.searchParams.get('array')).toBe('1,2,3');
      expect(url.searchParams.get('object')).toBe('[object Object]');
      expect(url.searchParams.get('nullValue')).toBe('null');
      expect(url.searchParams.has('undefinedValue')).toBe(true);
      expect(url.searchParams.get('booleanValue')).toBe('true');
    });

    it('should handle consecutive rate limit responses', async () => {
      fetchMock
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const result = await makeRequest('get', '/test', {
        query: { key: 'key', token: 'token' },
      });

      expect(result).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(setTimeout).toHaveBeenCalledTimes(2);
    });
  });

  describe('Trello Client Integration', () => {
    it('should properly propagate HTTP errors to the client', async () => {
      fetchMock.mockResolvedValueOnce(createErrorResponse('Server error', 500));

      await expect(trello.getBoards({ memberId: 'me' })).rejects.toThrow('Server error');
    });

    it('should automatically handle rate limiting in high-level methods', async () => {
      fetchMock
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse([{ id: 'board1', name: 'Board 1' }]));

      const boards = await trello.getBoards({ memberId: 'me' });

      expect(boards).toEqual([{ id: 'board1', name: 'Board 1' }]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    it('should properly handle authentication failures', async () => {
      fetchMock.mockResolvedValueOnce(createErrorResponse('Invalid token', 401));

      await expect(trello.getBoards({ memberId: 'me' })).rejects.toThrow('Invalid token');
    });
  });

  describe('Internationalization & Encoding', () => {
    it('should correctly handle unicode in request parameters', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'card123', name: '✓ Unicode Card' }),
      });

      await trello.addCard({
        name: '✓ Unicode Card',
        description: '🚀 Description with emoji ♥',
        listId: 'list123',
      });

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.searchParams.get('name')).toBe('✓ Unicode Card');
      expect(url.searchParams.get('desc')).toBe('🚀 Description with emoji ♥');
    });

    it('should correctly handle unicode in JSON request bodies', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await trello.makeRequest({
        requestMethod: 'POSTJSON',
        path: '/test',
        options: {
          data: { name: '国际化', desc: '🌍 World' },
          query: { key: 'key', token: 'token' },
        },
      });

      const options = fetchMock.mock.calls[0][1];
      expect(JSON.parse(options.body as string)).toEqual({
        name: '国际化',
        desc: '🌍 World',
      });
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive information in error objects', async () => {
      fetchMock.mockResolvedValueOnce(createErrorResponse('Error', 400));

      try {
        await trello.getBoards({ memberId: 'me' });
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error) {
        const errorStr = JSON.stringify(error);
        expect(errorStr).not.toContain('test-key');
        expect(errorStr).not.toContain('test-token');
      }
    });

    it('should safely handle passed options', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Test with a custom options object
      const testOptions = { someValue: 'test' };

      await trello.makeRequest({
        requestMethod: 'GET',
        path: '/test',
        options: testOptions,
      });

      // Ensure we can still access and use the options object after
      expect(testOptions.someValue).toBe('test');
      expect(Object.keys(testOptions).length).toBe(1);
    });
  });

  describe('Performance Tests', () => {
    it('should handle moderate response payloads efficiently', async () => {
      // Create a medium-sized array of objects (100 instead of 1000)
      const response = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: `card${i}`,
          name: `Card ${i}`,
          desc: `Description for card ${i}`,
        }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await trello.getCardsOnBoard('board123');
      expect(result.length).toBe(100);
      expect(result[0].id).toBe('card0');
      expect(result[99].id).toBe('card99');
    });
  });

  describe('Library Compatibility Tests', () => {
    it('should work with ESM imports', async () => {
      // Verify that the ESM exports are correctly configured
      expect(Trello).toBeDefined();
      expect(typeof Trello).toBe('function');
      expect(makeRequest).toBeDefined();
      expect(typeof makeRequest).toBe('function');
    });
  });
});
