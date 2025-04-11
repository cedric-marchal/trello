// tests/rate-limiting.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRequest } from '../src/http.js';
import { Trello } from '../src/index.js';
import { createMockResponse, createRateLimitResponse } from './utils.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Rate Limiting Tests', () => {
  beforeEach(() => {
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

  describe('HTTP Client Rate Limiting', () => {
    it('should retry after rate limit up to the maximum retries', async () => {
      // Simulate always hitting rate limit
      fetchMock.mockResolvedValue(createRateLimitResponse());

      // We'll need to create our own implementation to count retries
      let retryCount = 0;
      vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
        retryCount++;
        cb();
        return 0 as unknown as NodeJS.Timeout;
      });

      // Should eventually give up after multiple retries
      await expect(
        makeRequest('get', '/test', { query: { key: 'key', token: 'token' } })
      ).rejects.toThrow('Rate limit exceeded');

      // Expect multiple retries (the exact number might depend on your implementation)
      expect(retryCount).toBeGreaterThan(0);
      expect(fetchMock).toHaveBeenCalledTimes(retryCount + 1); // Original + retries
    });

    it('should recover after a single rate limit', async () => {
      fetchMock
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const result = await makeRequest('get', '/test', {
        query: { key: 'key', token: 'token' },
      });

      expect(result).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    it('should handle rate limits with proper backoff delay', async () => {
      fetchMock
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      // Replace setTimeout with a version that checks the delay
      let backoffDelay = 0;
      vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void, delay?: number) => {
        backoffDelay = delay || 0;
        cb();
        return 0 as unknown as NodeJS.Timeout;
      });

      await makeRequest('get', '/test', { query: { key: 'key', token: 'token' } });

      // Expect a reasonable backoff delay
      expect(backoffDelay).toBeGreaterThan(0);
    });
  });

  describe('Trello Client Rate Limiting Integration', () => {
    let trello: Trello;

    beforeEach(() => {
      trello = new Trello('test-key', 'test-token');
    });

    it('should handle rate limits transparently in high-level methods', async () => {
      fetchMock
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse([{ id: 'board1', name: 'Board 1' }]));

      const result = await trello.getBoards({ memberId: 'me' });

      expect(result).toEqual([{ id: 'board1', name: 'Board 1' }]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential API calls with rate limits', async () => {
      // First call: rate limit then success
      fetchMock
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse([{ id: 'board1', name: 'Board 1' }]))
        // Second call: rate limit then success
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse({ id: 'card1', name: 'Card 1' }));

      // Make two sequential API calls
      const boards = await trello.getBoards({ memberId: 'me' });
      const card = await trello.getCardById({ cardId: 'card1' });

      expect(boards).toEqual([{ id: 'board1', name: 'Board 1' }]);
      expect(card).toEqual({ id: 'card1', name: 'Card 1' });
      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(setTimeout).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limits in batch operations', async () => {
      // Setup mock responses with rate limits for some calls
      fetchMock
        // First batch call
        .mockResolvedValueOnce(createMockResponse([{ id: 'board1' }]))
        // Second batch call - rate limited then success
        .mockResolvedValueOnce(createRateLimitResponse())
        .mockResolvedValueOnce(createMockResponse([{ id: 'list1' }]))
        // Third batch call
        .mockResolvedValueOnce(createMockResponse([{ id: 'card1' }]));

      // Perform a batch of operations
      const [boards, lists, cards] = await Promise.all([
        trello.getBoards({ memberId: 'me' }),
        trello.getListsOnBoard('board1'),
        trello.getCardsOnList('list1'),
      ]);

      expect(boards).toEqual([{ id: 'board1' }]);
      expect(lists).toEqual([{ id: 'list1' }]);
      expect(cards).toEqual([{ id: 'card1' }]);
      expect(fetchMock).toHaveBeenCalledTimes(4); // Including one retry
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });
  });
});
