// tests/trello.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Trello } from '../src/index.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Trello', () => {
  let trello: Trello;

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('makeRequest', () => {
    it('should throw error if type of options passed is not object', async () => {
      await expect(
        trello.makeRequest({
          requestMethod: 'GET',
          path: 'somePath',
          // @ts-expect-error - Testing invalid input
          options: 'wrongOptions',
        })
      ).rejects.toThrow(TypeError);
    });

    it('should throw error if type of a method passed is not string', async () => {
      await expect(
        trello.makeRequest({
          // @ts-expect-error - Testing invalid input
          requestMethod: 123,
          path: 'somePath',
        })
      ).rejects.toThrow(TypeError);
    });

    it('should throw error if a method passed is not one of these: POST, GET, PUT, DELETE', async () => {
      await expect(
        trello.makeRequest({
          requestMethod: 'patch',
          path: 'somePath',
        })
      ).rejects.toThrow('Unsupported requestMethod');
    });

    it('should not throw error if no options are passed', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(
        trello.makeRequest({
          requestMethod: 'GET',
          path: '/1/members/me/tokens',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('addBoard', () => {
    it('should post to the boards endpoint with correct parameters', async () => {
      const mockResponse = {
        id: 'board123',
        name: 'Test Board',
        desc: 'Test Description',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await trello.addBoard({
        name: 'Test Board',
        description: 'Test Description',
        organizationId: 'org123',
      });

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe('/1/boards/');
      expect(url.searchParams.get('name')).toBe('Test Board');
      expect(url.searchParams.get('desc')).toBe('Test Description');
      expect(url.searchParams.get('idOrganization')).toBe('org123');
      expect(url.searchParams.get('key')).toBe('key');
      expect(url.searchParams.get('token')).toBe('token');
    });
  });

  describe('getBoards', () => {
    it('should retrieve boards for a member', async () => {
      const mockResponse = [
        { id: 'board1', name: 'Board 1' },
        { id: 'board2', name: 'Board 2' },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await trello.getBoards({ memberId: 'me' });

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe('/1/members/me/boards');
    });
  });

  describe('addCard', () => {
    it('should create a card with the correct parameters', async () => {
      const mockResponse = {
        id: 'card123',
        name: 'Test Card',
        desc: 'Test Description',
        idList: 'list123',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await trello.addCard({
        name: 'Test Card',
        description: 'Test Description',
        listId: 'list123',
      });

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe('/1/cards');
      expect(url.searchParams.get('name')).toBe('Test Card');
      expect(url.searchParams.get('desc')).toBe('Test Description');
      expect(url.searchParams.get('idList')).toBe('list123');
    });
  });

  describe('error handling', () => {
    it('should handle rate limiting', async () => {
      // Mock a 429 response followed by a successful response
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'board123', name: 'Test Board' }),
        });

      // Mock setTimeout to avoid waiting in tests
      vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
        cb();
        return 0 as unknown as NodeJS.Timeout;
      });

      const result = await trello.addBoard({ name: 'Test Board' });

      expect(result).toEqual({ id: 'board123', name: 'Test Board' });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should throw on HTTP errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      await expect(trello.getBoards({ memberId: 'me' })).rejects.toThrow();
    });
  });
});
