import { vi } from 'vitest';

/**
 * Creates a mock response object for fetch
 */
export function createMockResponse<T>(data: T, options?: { status?: number; ok?: boolean }) {
  return {
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

/**
 * Creates a mock error response
 */
export function createErrorResponse(errorMessage = 'Error', status = 400) {
  return {
    ok: false,
    status,
    json: vi.fn().mockRejectedValue(new Error(errorMessage)),
    text: vi.fn().mockResolvedValue(errorMessage),
  };
}

/**
 * Creates a mock rate limit response
 */
export function createRateLimitResponse() {
  return {
    ok: false,
    status: 429,
    text: vi.fn().mockResolvedValue('Rate limit exceeded'),
  };
}

/**
 * Extracts query parameters from a URL used in fetch mock
 */
export function getQueryParams(url: string): Record<string, string> {
  const parsedUrl = new URL(url);
  const params: Record<string, string> = {};
  
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
} 