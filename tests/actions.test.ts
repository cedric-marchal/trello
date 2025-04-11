// tests/actions.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Trello } from '../src/index.js';
import { Action, Reaction } from '../src/types.js';
import { createMockResponse } from './utils.js';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Trello Actions', () => {
  let trello: Trello;
  const actionId = 'action123';

  beforeEach(() => {
    trello = new Trello('key', 'token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAction', () => {
    it('should retrieve a specific action by ID', async () => {
      const mockAction: Action = {
        id: actionId,
        idMemberCreator: 'user123',
        data: { text: 'Test comment' },
        type: 'commentCard',
        date: '2023-04-21T14:30:45.123Z',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockAction));

      const result = await trello.getAction(actionId);

      expect(result).toEqual(mockAction);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}`);
    });
  });

  describe('getActionField', () => {
    it('should retrieve a specific field of an action', async () => {
      const mockField = 'Test comment';

      fetchMock.mockResolvedValueOnce(createMockResponse(mockField));

      const result = await trello.getActionField(actionId, 'data');

      expect(result).toEqual(mockField);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/data`);
    });
  });

  describe('updateAction', () => {
    it('should update an action with new text', async () => {
      const newText = 'Updated comment text';
      const mockResponse = { success: true };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await trello.updateAction(actionId, newText);

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}`);
      expect(url.searchParams.get('text')).toBe(newText);
    });
  });

  describe('updateCommentAction', () => {
    it('should update a comment action text', async () => {
      const newText = 'Updated comment text';
      const mockResponse = { success: true };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await trello.updateCommentAction(actionId, newText);

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/text`);
      expect(url.searchParams.get('value')).toBe(newText);
    });
  });

  describe('deleteAction', () => {
    it('should delete a comment action', async () => {
      const mockResponse = { success: true };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await trello.deleteAction(actionId);

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}`);
    });
  });

  describe('getActionBoard', () => {
    it('should get the board associated with an action', async () => {
      const mockBoard = {
        id: 'board123',
        name: 'Test Board',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockBoard));

      const result = await trello.getActionBoard(actionId);

      expect(result).toEqual(mockBoard);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/board`);
    });
  });

  describe('getActionCard', () => {
    it('should get the card associated with an action', async () => {
      const mockCard = {
        id: 'card123',
        name: 'Test Card',
        idBoard: 'board123',
        idList: 'list123',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockCard));

      const result = await trello.getActionCard(actionId);

      expect(result).toEqual(mockCard);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/card`);
    });
  });

  describe('getActionList', () => {
    it('should get the list associated with an action', async () => {
      const mockList = {
        id: 'list123',
        name: 'Test List',
        idBoard: 'board123',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockList));

      const result = await trello.getActionList(actionId);

      expect(result).toEqual(mockList);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/list`);
    });
  });

  describe('getActionMember', () => {
    it('should get the member associated with an action', async () => {
      const mockMember = {
        id: 'member123',
        username: 'testuser',
        fullName: 'Test User',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockMember));

      const result = await trello.getActionMember(actionId);

      expect(result).toEqual(mockMember);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/member`);
    });
  });

  describe('getActionMemberCreator', () => {
    it('should get the member creator of an action', async () => {
      const mockMember = {
        id: 'member123',
        username: 'testuser',
        fullName: 'Test User',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockMember));

      const result = await trello.getActionMemberCreator(actionId);

      expect(result).toEqual(mockMember);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/memberCreator`);
    });
  });

  describe('getActionOrganization', () => {
    it('should get the organization associated with an action', async () => {
      const mockOrg = {
        id: 'org123',
        name: 'testorg',
        displayName: 'Test Organization',
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockOrg));

      const result = await trello.getActionOrganization(actionId);

      expect(result).toEqual(mockOrg);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/organization`);
    });
  });
});

describe('Trello Reactions', () => {
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

  describe('getActionReactions', () => {
    it('should get reactions for an action', async () => {
      const mockReactions: Reaction[] = [
        {
          id: reactionId,
          idMember: 'member123',
          idModel: actionId,
          idAction: actionId,
          emoji: {
            unified: '1f44d',
            native: '👍',
            name: 'thumbsup',
            shortName: '+1',
          },
        },
      ];

      fetchMock.mockResolvedValueOnce(createMockResponse(mockReactions));

      const result = await trello.getActionReactions(actionId);

      expect(result).toEqual(mockReactions);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/reactions`);
    });

    it('should pass member and emoji parameters correctly', async () => {
      const mockReactions: Reaction[] = [
        {
          id: reactionId,
          idMember: 'member123',
          idModel: actionId,
          idAction: actionId,
          emoji: {
            unified: '1f44d',
            native: '👍',
            name: 'thumbsup',
            shortName: '+1',
          },
          member: {
            id: 'member123',
            username: 'testuser',
            fullName: 'Test User',
          },
        },
      ];

      fetchMock.mockResolvedValueOnce(createMockResponse(mockReactions));

      const result = await trello.getActionReactions(actionId, { member: true, emoji: true });

      expect(result).toEqual(mockReactions);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/reactions`);
      expect(url.searchParams.get('member')).toBe('true');
      expect(url.searchParams.get('emoji')).toBe('true');
    });
  });

  describe('addReactionToAction', () => {
    it('should add a reaction to an action', async () => {
      const reactionData = { shortName: '+1' };
      const mockReaction: Reaction = {
        id: reactionId,
        idMember: 'member123',
        idModel: actionId,
        idAction: actionId,
        emoji: {
          unified: '1f44d',
          native: '👍',
          name: 'thumbsup',
          shortName: '+1',
        },
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockReaction));

      const result = await trello.addReactionToAction(actionId, reactionData);

      expect(result).toEqual(mockReaction);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/reactions`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');

      // Dans le test, les données sont passées à la méthode makeRequest,
      // mais les headers ne sont pas directement accessibles dans le mock de fetch
      // donc nous vérifions seulement que fetch a été appelé avec les bons paramètres
    });
  });

  describe('getActionReaction', () => {
    it('should get a specific reaction for an action', async () => {
      const mockReaction: Reaction = {
        id: reactionId,
        idMember: 'member123',
        idModel: actionId,
        idAction: actionId,
        emoji: {
          unified: '1f44d',
          native: '👍',
          name: 'thumbsup',
          shortName: '+1',
        },
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockReaction));

      const result = await trello.getActionReaction(actionId, reactionId);

      expect(result).toEqual(mockReaction);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/reactions/${reactionId}`);
    });
  });

  describe('deleteActionReaction', () => {
    it('should delete a reaction from an action', async () => {
      const mockResponse = { success: true };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await trello.deleteActionReaction(actionId, reactionId);

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/reactions/${reactionId}`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    });
  });

  describe('getActionReactionsSummary', () => {
    it('should get a summary of reactions for an action', async () => {
      const mockSummary = {
        summary: [
          { shortName: '+1', count: 3 },
          { shortName: 'smile', count: 1 },
        ],
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockSummary));

      const result = await trello.getActionReactionsSummary(actionId);

      expect(result).toEqual(mockSummary);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const url = new URL(fetchMock.mock.calls[0][0]);
      expect(url.pathname).toBe(`/1/actions/${actionId}/reactionsSummary`);
    });
  });
});
