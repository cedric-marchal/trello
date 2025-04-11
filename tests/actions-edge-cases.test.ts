import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Trello } from '../src/index.js';
import { createErrorResponse, createRateLimitResponse } from './utils.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Trello Actions - Error Handling', () => {
  let trello: Trello;
  const actionId = 'action123';

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle rate limiting when getting an action', async () => {
    // Mock a 429 response followed by a successful response
    fetchMock.mockResolvedValueOnce(createRateLimitResponse()).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: actionId, type: 'commentCard' }),
    });

    // Mock setTimeout to avoid waiting in tests
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 0 as unknown as NodeJS.Timeout;
    });

    const result = await trello.getAction(actionId);

    expect(result).toEqual({ id: actionId, type: 'commentCard' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when the action does not exist', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Action not found', 404));

    await expect(trello.getAction(actionId)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when trying to delete a non-comment action', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Cannot delete this type of action', 400));

    await expect(trello.deleteAction(actionId)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when trying to update a non-comment action', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Cannot update this type of action', 400));

    await expect(trello.updateAction(actionId, 'New text')).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('Trello Actions - Optional Parameters', () => {
  let trello: Trello;
  const actionId = 'action123';

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get an action with display parameters', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: actionId, type: 'commentCard' }),
    });

    // We would use makeRequest directly since the getAction method doesn't accept these parameters
    await trello.makeRequest({
      requestMethod: 'GET',
      path: `/1/actions/${actionId}`,
      options: { display: true, entities: true },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('display')).toBe('true');
    expect(url.searchParams.get('entities')).toBe('true');
  });

  it('should get an action with member parameters', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: actionId, type: 'commentCard' }),
    });

    // We would use makeRequest directly since the getAction method doesn't accept these parameters
    await trello.makeRequest({
      requestMethod: 'GET',
      path: `/1/actions/${actionId}`,
      options: { member: true, member_fields: 'username,fullName' },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('member')).toBe('true');
    expect(url.searchParams.get('member_fields')).toBe('username,fullName');
  });
});

describe('Trello Reactions - Error Handling', () => {
  let trello: Trello;
  const actionId = 'action123';
  const reactionId = 'reaction456';

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle rate limiting when getting reactions', async () => {
    // Mock a 429 response followed by a successful response
    fetchMock.mockResolvedValueOnce(createRateLimitResponse()).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: reactionId, emoji: { shortName: '+1' } }],
    });

    // Mock setTimeout to avoid waiting in tests
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 0 as unknown as NodeJS.Timeout;
    });

    const result = await trello.getActionReactions(actionId);

    expect(result).toEqual([{ id: reactionId, emoji: { shortName: '+1' } }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when the action does not exist for reactions', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Action not found', 404));

    await expect(trello.getActionReactions(actionId)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when trying to add an invalid reaction', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Invalid reaction data', 400));

    await expect(
      trello.addReactionToAction(actionId, { shortName: 'invalid_emoji' })
    ).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when trying to delete a non-existent reaction', async () => {
    fetchMock.mockResolvedValueOnce(createErrorResponse('Reaction not found', 404));

    await expect(trello.deleteActionReaction(actionId, 'non_existent')).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('Trello Actions - Complex Scenarios', () => {
  let trello: Trello;

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update an action and then retrieve it with the updated content', async () => {
    const actionId = 'action123';
    const originalComment = 'Original comment';
    const updatedComment = 'Updated comment';

    // Mock initial action request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: actionId,
        type: 'commentCard',
        data: { text: originalComment },
      }),
    });

    // Get the initial action
    const initialAction = await trello.getAction(actionId);
    expect(initialAction.data.text).toBe(originalComment);

    // Mock update request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Update the action
    await trello.updateAction(actionId, updatedComment);

    // Mock get updated action request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: actionId,
        type: 'commentCard',
        data: { text: updatedComment },
      }),
    });

    // Get the updated action
    const updatedAction = await trello.getAction(actionId);
    expect(updatedAction.data.text).toBe(updatedComment);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should add a reaction to an action and then retrieve it in the reactions list', async () => {
    const actionId = 'action123';
    const reactionId = 'reaction456';
    const reactionShortName = '+1';

    // Mock empty reactions list
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Get initial empty reactions list
    const initialReactions = await trello.getActionReactions(actionId);
    expect(initialReactions.length).toBe(0);

    // Mock add reaction request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: reactionId,
        idMember: 'member123',
        idAction: actionId,
        emoji: {
          unified: '1f44d',
          native: '👍',
          name: 'thumbsup',
          shortName: reactionShortName,
        },
      }),
    });

    // Add a reaction
    await trello.addReactionToAction(actionId, { shortName: reactionShortName });

    // Mock updated reactions list
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: reactionId,
          idMember: 'member123',
          idAction: actionId,
          emoji: {
            unified: '1f44d',
            native: '👍',
            name: 'thumbsup',
            shortName: reactionShortName,
          },
        },
      ],
    });

    // Get updated reactions list
    const updatedReactions = await trello.getActionReactions(actionId);
    expect(updatedReactions.length).toBe(1);
    expect(updatedReactions[0].emoji.shortName).toBe(reactionShortName);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
