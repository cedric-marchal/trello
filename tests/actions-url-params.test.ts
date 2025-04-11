// tests/actions-url-params.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Trello } from '../src/index.js';
import { createMockResponse } from './utils.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Trello Actions - URL and Parameters', () => {
  let trello: Trello;
  const actionId = 'action123';

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function verifyAuthParams(url: URL) {
    expect(url.searchParams.get('key')).toBe('key');
    expect(url.searchParams.get('token')).toBe('token');
  }

  it('should form correct URL for getActionsOnCard', async () => {
    const cardId = 'card123';

    fetchMock.mockResolvedValueOnce(createMockResponse([]));

    await trello.getActionsOnCard(cardId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/cards/${cardId}/actions`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionsOnBoard', async () => {
    const boardId = 'board123';

    fetchMock.mockResolvedValueOnce(createMockResponse([]));

    await trello.getActionsOnBoard(boardId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/boards/${boardId}/actions`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getAction', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: actionId }));

    await trello.getAction(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionField', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse('field data'));

    await trello.getActionField(actionId, 'data');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/data`);
    verifyAuthParams(url);
  });

  it('should form correct URL for updateAction', async () => {
    const newText = 'Updated comment';

    fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

    await trello.updateAction(actionId, newText);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}`);
    expect(url.searchParams.get('text')).toBe(newText);
    verifyAuthParams(url);
  });

  it('should form correct URL for updateCommentAction', async () => {
    const newText = 'Updated comment';

    fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

    await trello.updateCommentAction(actionId, newText);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/text`);
    expect(url.searchParams.get('value')).toBe(newText);
    verifyAuthParams(url);
  });

  it('should form correct URL for deleteAction', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

    await trello.deleteAction(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}`);
    verifyAuthParams(url);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
  });

  it('should form correct URL for getActionBoard', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: 'board123', name: 'Test Board' }));

    await trello.getActionBoard(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/board`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionCard', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: 'card123', name: 'Test Card' }));

    await trello.getActionCard(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/card`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionList', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: 'list123', name: 'Test List' }));

    await trello.getActionList(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/list`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionMember', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: 'member123', username: 'testuser' }));

    await trello.getActionMember(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/member`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionMemberCreator', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: 'member123', username: 'testuser' }));

    await trello.getActionMemberCreator(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/memberCreator`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionOrganization', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ id: 'org123', name: 'testorg' }));

    await trello.getActionOrganization(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/organization`);
    verifyAuthParams(url);
  });
});

describe('Trello Reactions - URL and Parameters', () => {
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

  function verifyAuthParams(url: URL) {
    expect(url.searchParams.get('key')).toBe('key');
    expect(url.searchParams.get('token')).toBe('token');
  }

  it('should form correct URL for getActionReactions', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse([]));

    await trello.getActionReactions(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactions`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionReactions with parameters', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse([]));

    await trello.getActionReactions(actionId, { member: true, emoji: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactions`);
    expect(url.searchParams.get('member')).toBe('true');
    expect(url.searchParams.get('emoji')).toBe('true');
    verifyAuthParams(url);
  });

  it('should form correct URL for addReactionToAction', async () => {
    const reactionData = { shortName: '+1' };

    fetchMock.mockResolvedValueOnce(
      createMockResponse({ id: reactionId, emoji: { shortName: '+1' } })
    );

    await trello.addReactionToAction(actionId, reactionData);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactions`);
    verifyAuthParams(url);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
  });

  it('should form correct URL for getActionReaction', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({ id: reactionId, emoji: { shortName: '+1' } })
    );

    await trello.getActionReaction(actionId, reactionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactions/${reactionId}`);
    verifyAuthParams(url);
  });

  it('should form correct URL for getActionReaction with parameters', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({ id: reactionId, emoji: { shortName: '+1' } })
    );

    await trello.getActionReaction(actionId, reactionId, { member: true, emoji: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactions/${reactionId}`);
    expect(url.searchParams.get('member')).toBe('true');
    expect(url.searchParams.get('emoji')).toBe('true');
    verifyAuthParams(url);
  });

  it('should form correct URL for deleteActionReaction', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

    await trello.deleteActionReaction(actionId, reactionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactions/${reactionId}`);
    verifyAuthParams(url);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
  });

  it('should form correct URL for getActionReactionsSummary', async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse({ summary: [] }));

    await trello.getActionReactionsSummary(actionId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe(`/1/actions/${actionId}/reactionsSummary`);
    verifyAuthParams(url);
  });
});
