// tests/http.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRequest } from '../src/http.js';
import { createErrorResponse, createMockResponse, createRateLimitResponse } from './utils.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('HTTP Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should make a GET request with query parameters', async () => {
    const mockData = { id: '123', name: 'Test' };
    fetchMock.mockResolvedValueOnce(createMockResponse(mockData));

    const result = await makeRequest('get', '/test', {
      query: {
        key: 'test-key',
        token: 'test-token',
        param: 'value',
      },
    });

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe('/test');
    expect(url.searchParams.get('key')).toBe('test-key');
    expect(url.searchParams.get('token')).toBe('test-token');
    expect(url.searchParams.get('param')).toBe('value');

    const options = fetchMock.mock.calls[0][1];
    expect(options.method).toBe('GET');
  });

  it('should make a POST request with JSON body', async () => {
    const mockData = { id: '123', success: true };
    fetchMock.mockResolvedValueOnce(createMockResponse(mockData));

    const data = { name: 'Test', value: 42 };
    const result = await makeRequest('postjson', '/test', {
      headers: { 'Content-Type': 'application/json' },
      data,
      query: { key: 'test-key', token: 'test-token' },
    });

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe('/test');

    const options = fetchMock.mock.calls[0][1];
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(options.body).toBe(JSON.stringify(data));
  });

  it('should handle rate limiting and retry', async () => {
    // First response is rate limited, second succeeds
    fetchMock
      .mockResolvedValueOnce(createRateLimitResponse())
      .mockResolvedValueOnce(createMockResponse({ success: true }));

    // Mock setTimeout to avoid waiting in tests
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 0 as unknown as NodeJS.Timeout;
    });

    const result = await makeRequest('get', '/test', {
      query: { key: 'test-key', token: 'test-token' },
    });

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenCalled();
  });

  it('should throw an error on HTTP error status', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Bad Request', 400));

    await expect(
      makeRequest('get', '/test', { query: { key: 'test-key', token: 'test-token' } })
    ).rejects.toThrow();
  });

  it('should use specified base URI', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

    await makeRequest(
      'get',
      '/test',
      { query: { key: 'test-key', token: 'test-token' } },
      'https://custom-api.example.com'
    );

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe('https://custom-api.example.com');
    expect(url.pathname).toBe('/test');
  });
});
