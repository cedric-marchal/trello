// src/http.ts

import {
  JsonRequestOptions,
  RequestMethod,
  RequestOptions,
  RequestQuery,
  TrelloResponse,
} from './types.js';

// Rate limiting constants
const MIN_REQUEST_DELAY = 500;
const MAX_REQUEST_DELAY = 7000;

/**
 * Makes an HTTP request to the Trello API
 */
export async function makeRequest<T = TrelloResponse>(
  method: RequestMethod,
  uri: string,
  options: RequestOptions | JsonRequestOptions,
  baseUri = 'https://api.trello.com'
): Promise<T> {
  const url = new URL(`${baseUri}${uri}`);

  // Configure fetch options
  const fetchOptions: RequestInit = {
    method: method.replace(/json$/, '').toUpperCase(),
  };

  // Handle JSON content-type requests
  if (method.includes('json')) {
    const jsonOptions = options as JsonRequestOptions;

    // Add query parameters to URL
    Object.entries(jsonOptions.query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    // Set headers and body
    fetchOptions.headers = jsonOptions.headers;
    if (jsonOptions.data) {
      fetchOptions.body = JSON.stringify(jsonOptions.data);
    }
  } else {
    // Regular requests
    // Add query parameters to URL
    const query = (options as { query: RequestQuery }).query;
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), fetchOptions);

  // Handle rate limiting (429)
  if (response.status === 429) {
    const delay =
      Math.floor(Math.random() * (MAX_REQUEST_DELAY - MIN_REQUEST_DELAY)) + MIN_REQUEST_DELAY;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return makeRequest(method, uri, options, baseUri);
  }

  // Handle other errors
  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(errorText);
    Object.defineProperty(error, 'response', { value: response });
    throw error;
  }

  // Return successful response
  return (await response.json()) as T;
}
