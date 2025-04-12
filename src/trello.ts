// src/trello.ts

import { makeRequest } from './http.js';
import {
  Board,
  Card,
  CheckItem,
  Checklist,
  CustomField,
  Label,
  List,
  Member,
  Organization,
  RequestMethod,
  RequestOptions,
  RequestQuery,
  Sticker,
  TrelloResponse,
  Webhook,
} from './types.js';

/**
 * Trello API client
 */
export class Trello {
  private readonly uri: string;
  private readonly key: string;
  private readonly token: string;

  /**
   * Creates a new Trello API client instance
   *
   * @param keyOrConfig Your Trello API key or a configuration object
   * @param token Your Trello API token (not required if using configuration object)
   */
  constructor(keyOrConfig: string | { apiKey: string; apiToken: string }, token?: string) {
    this.uri = 'https://api.trello.com';

    if (typeof keyOrConfig === 'string') {
      if (!token) {
        throw new Error('Token is required when providing key as a string');
      }
      this.key = keyOrConfig;
      this.token = token;
    } else {
      if (!keyOrConfig.apiKey || !keyOrConfig.apiToken) {
        throw new Error('apiKey and apiToken are required in the configuration object');
      }
      this.key = keyOrConfig.apiKey;
      this.token = keyOrConfig.apiToken;
    }
  }

  /**
   * Creates a query object with authentication
   */
  private createQuery(): RequestQuery {
    return { key: this.key, token: this.token };
  }

  /**
   * Makes a request to the Trello API
   *
   * @param params Request parameters
   */
  public async makeRequest<T = TrelloResponse>(params: {
    requestMethod: RequestMethod | string;
    path: string;
    options?: RequestOptions;
  }): Promise<T> {
    const { requestMethod, path, options = {} } = params;

    if (typeof requestMethod !== 'string') {
      throw new TypeError('requestMethod should be a string');
    }

    if (typeof options !== 'object') {
      throw new TypeError('options should be an object');
    }

    // Ensure method is a valid RequestMethod
    const method = requestMethod as RequestMethod;
    const keyTokenObj = this.createQuery();
    const query = { ...options, ...keyTokenObj };

    if (method === 'POST_JSON' || method === 'PUT_JSON') {
      const jsonOptions = {
        headers: { 'Content-Type': 'application/json' },
        data: (options as { data?: unknown }).data,
        query,
      };

      delete (options as { data?: unknown }).data;
      return makeRequest<T>(method, path, jsonOptions, this.uri);
    } else {
      return makeRequest<T>(method, path, { query }, this.uri);
    }
  }

  /**
   * Adds a new board
   *
   * @param params Board parameters
   */
  public async addBoard(params: {
    name: string;
    description?: string | null;
    organizationId?: string | null;
  }): Promise<Board> {
    const { name, description = null, organizationId = null } = params;
    const query = this.createQuery();
    query.name = name;

    if (description !== null) {
      query.desc = description;
    }

    if (organizationId !== null) {
      query.idOrganization = organizationId;
    }

    return makeRequest<Board>('POST', '/1/boards/', { query }, this.uri);
  }

  /**
   * Copies a board
   *
   * @param params Board copy parameters
   */
  public async copyBoard(params: { name: string; sourceBoardId: string }): Promise<Board> {
    const { name, sourceBoardId } = params;
    const query = this.createQuery();
    query.name = name;
    query.idBoardSource = sourceBoardId;

    return makeRequest<Board>('POST', '/1/boards/', { query }, this.uri);
  }

  /**
   * Updates a board preference
   *
   * @param params Update parameters
   */
  public async updateBoardPref(params: {
    boardId: string;
    field: string;
    value: string;
  }): Promise<TrelloResponse> {
    const { boardId, field, value } = params;
    const query = this.createQuery();
    query.value = value;

    return makeRequest('PUT', `/1/boards/${boardId}/prefs/${field}`, { query }, this.uri);
  }

  /**
   * Adds a card to a list
   *
   * @param params Card parameters
   */
  public async addCard(params: {
    name: string;
    description?: string | null;
    listId: string;
  }): Promise<Card> {
    const { name, description = null, listId } = params;
    const query = this.createQuery();
    query.name = name;
    query.idList = listId;

    if (description !== null) {
      query.desc = description;
    }

    return makeRequest<Card>('POST', '/1/cards', { query }, this.uri);
  }

  /**
   * Adds a card with extra parameters
   *
   * @param params Card parameters with extras
   */
  public async addCardWithExtraParams(params: {
    name: string;
    extraParams: Record<string, unknown>;
    listId: string;
  }): Promise<Card> {
    const { name, extraParams, listId } = params;
    const query = this.createQuery();
    query.name = name;
    query.idList = listId;

    Object.assign(query, extraParams);

    return makeRequest<Card>('POST', '/1/cards', { query }, this.uri);
  }

  /**
   * Gets a card from a board
   *
   * @param params Card lookup parameters
   */
  public async getCard(params: { boardId: string | null; cardId: string }): Promise<Card> {
    const { boardId, cardId } = params;
    if (boardId === null) {
      return makeRequest<Card>(
        'GET',
        `/1/cards/${cardId}`,
        { query: this.createQuery() },
        this.uri
      );
    }

    return makeRequest<Card>(
      'GET',
      `/1/boards/${boardId}/cards/${cardId}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets a card by ID
   *
   * @param params Card ID parameter
   */
  public async getCardById(params: { cardId: string }): Promise<Card> {
    const { cardId } = params;
    return makeRequest<Card>('GET', `/1/cards/${cardId}`, { query: this.createQuery() }, this.uri);
  }

  /**
   * Gets all cards on a list
   *
   * @param params List parameters
   */
  public async getCardsForList(params: { listId: string; actions?: string }): Promise<Card[]> {
    const { listId, actions } = params;
    const query = this.createQuery();

    if (actions) {
      query.actions = actions;
    }

    return makeRequest<Card[]>('GET', `/1/lists/${listId}/cards`, { query }, this.uri);
  }

  /**
   * Renames a list
   *
   * @param params Rename parameters
   */
  public async renameList(params: { listId: string; name: string }): Promise<TrelloResponse> {
    const { listId, name } = params;
    const query = this.createQuery();
    query.value = name;

    return makeRequest('PUT', `/1/lists/${listId}/name`, { query }, this.uri);
  }

  /**
   * Adds a list to a board
   *
   * @param params List parameters
   */
  public async addListToBoard(params: { boardId: string; name: string }): Promise<List> {
    const { boardId, name } = params;
    const query = this.createQuery();
    query.name = name;

    return makeRequest<List>('POST', `/1/boards/${boardId}/lists`, { query }, this.uri);
  }

  /**
   * Adds a member to a board
   *
   * @param params Member parameters
   */
  public async addMemberToBoard(params: {
    boardId: string;
    memberId: string;
    type: 'normal' | 'admin' | 'observer';
  }): Promise<TrelloResponse> {
    const { boardId, memberId, type } = params;
    const query = this.createQuery();
    const data = { type };

    return makeRequest(
      'PUT',
      `/1/boards/${boardId}/members/${memberId}`,
      { data, query },
      this.uri
    );
  }

  /**
   * Adds a comment to a card
   *
   * @param params Comment parameters
   */
  public async addCommentToCard(params: {
    cardId: string;
    comment: string;
  }): Promise<TrelloResponse> {
    const { cardId, comment } = params;
    const query = this.createQuery();
    query.text = comment;

    return makeRequest('POST', `/1/cards/${cardId}/actions/comments`, { query }, this.uri);
  }

  /**
   * Adds an attachment to a card
   *
   * @param params Attachment parameters
   */
  public async addAttachmentToCard(params: {
    cardId: string;
    url: string;
  }): Promise<TrelloResponse> {
    const { cardId, url } = params;
    const query = this.createQuery();
    query.url = url;

    return makeRequest('POST', `/1/cards/${cardId}/attachments`, { query }, this.uri);
  }

  /**
   * Adds a member to a card
   *
   * @param params Member parameters
   */
  public async addMemberToCard(params: {
    cardId: string;
    memberId: string;
  }): Promise<TrelloResponse> {
    const { cardId, memberId } = params;
    const query = this.createQuery();
    query.value = memberId;

    return makeRequest('POST', `/1/cards/${cardId}/members`, { query }, this.uri);
  }

  /**
   * Removes a member from a card
   *
   * @param params Remove member parameters
   */
  public async delMemberFromCard(params: {
    cardId: string;
    memberId: string;
  }): Promise<TrelloResponse> {
    const { cardId, memberId } = params;
    const query = this.createQuery();

    return makeRequest('DELETE', `/1/cards/${cardId}/members/${memberId}`, { query }, this.uri);
  }

  /**
   * Gets all boards for a member
   *
   * @param params Member ID parameter
   */
  public async getBoards(params: { memberId: string }): Promise<Board[]> {
    const { memberId } = params;
    return makeRequest<Board[]>(
      'GET',
      `/1/members/${memberId}/boards`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets an organization
   *
   * @param params Organization parameters
   */
  public async getOrganization(params: { organizationId: string }): Promise<Organization> {
    const { organizationId } = params;
    return makeRequest<Organization>(
      'GET',
      `/1/organizations/${organizationId}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all boards in an organization
   *
   * @param organizationId ID of the organization
   */
  public async getOrgBoards(organizationId: string): Promise<Board[]> {
    return makeRequest<Board[]>(
      'GET',
      `/1/organizations/${organizationId}/boards`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Adds a checklist to a card
   *
   * @param cardId ID of the card
   * @param name Name of the checklist
   */
  public async addChecklistToCard(cardId: string, name: string): Promise<Checklist> {
    const query = this.createQuery();
    query.name = name;

    return makeRequest<Checklist>('POST', `/1/cards/${cardId}/checklists`, { query }, this.uri);
  }

  /**
   * Adds an existing checklist to a card
   *
   * @param cardId ID of the card
   * @param checklistId ID of the checklist
   */
  public async addExistingChecklistToCard(cardId: string, checklistId: string): Promise<Checklist> {
    const query = this.createQuery();
    query.idChecklistSource = checklistId;

    return makeRequest<Checklist>('POST', `/1/cards/${cardId}/checklists`, { query }, this.uri);
  }

  /**
   * Gets all checklists on a card
   *
   * @param cardId ID of the card
   */
  public async getChecklistsOnCard(cardId: string): Promise<Checklist[]> {
    return makeRequest<Checklist[]>(
      'GET',
      `/1/cards/${cardId}/checklists`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all actions on a card
   *
   * @param cardId ID of the card
   */
  public async getActionsOnCard(cardId: string): Promise<TrelloResponse[]> {
    return makeRequest<TrelloResponse[]>(
      'GET',
      `/1/cards/${cardId}/actions`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Adds an item to a checklist
   *
   * @param checklistId ID of the checklist
   * @param name Name of the item
   * @param pos Position of the item
   */
  public async addItemToChecklist(
    checklistId: string,
    name: string,
    pos: number | string
  ): Promise<CheckItem> {
    const query = this.createQuery();
    query.name = name;
    query.pos = pos;

    return makeRequest<CheckItem>(
      'POST',
      `/1/checklists/${checklistId}/checkitems`,
      { query },
      this.uri
    );
  }

  /**
   * Updates a card
   *
   * @param cardId ID of the card
   * @param field Field to update
   * @param value New value
   */
  public async updateCard(cardId: string, field: string, value: string): Promise<TrelloResponse> {
    const query = this.createQuery();
    query.value = value;

    return makeRequest('PUT', `/1/cards/${cardId}/${field}`, { query }, this.uri);
  }

  /**
   * Updates a checklist
   *
   * @param checklistId ID of the checklist
   * @param field Field to update
   * @param value New value
   */
  public async updateChecklist(
    checklistId: string,
    field: string,
    value: string
  ): Promise<TrelloResponse> {
    const query = this.createQuery();
    query.value = value;

    return makeRequest('PUT', `/1/checklists/${checklistId}/${field}`, { query }, this.uri);
  }

  /**
   * Updates a card name
   *
   * @param cardId ID of the card
   * @param name New name
   */
  public async updateCardName(cardId: string, name: string): Promise<TrelloResponse> {
    return this.updateCard(cardId, 'name', name);
  }

  /**
   * Updates a card description
   *
   * @param cardId ID of the card
   * @param description New description
   */
  public async updateCardDescription(cardId: string, description: string): Promise<TrelloResponse> {
    return this.updateCard(cardId, 'desc', description);
  }

  /**
   * Moves a card to a different list
   *
   * @param cardId ID of the card
   * @param listId ID of the target list
   */
  public async updateCardList(cardId: string, listId: string): Promise<TrelloResponse> {
    return this.updateCard(cardId, 'idList', listId);
  }

  /**
   * Gets a member
   *
   * @param memberId ID of the member
   */
  public async getMember(memberId: string): Promise<Member> {
    return makeRequest<Member>(
      'GET',
      `/1/member/${memberId}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all cards for a member
   *
   * @param memberId ID of the member
   */
  public async getMemberCards(memberId: string): Promise<Card[]> {
    return makeRequest<Card[]>(
      'GET',
      `/1/members/${memberId}/cards`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all members on a board
   *
   * @param boardId ID of the board
   */
  public async getBoardMembers(boardId: string): Promise<Member[]> {
    return makeRequest<Member[]>(
      'GET',
      `/1/boards/${boardId}/members`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all members in an organization
   *
   * @param organizationId ID of the organization
   */
  public async getOrgMembers(organizationId: string): Promise<Member[]> {
    return makeRequest<Member[]>(
      'GET',
      `/1/organizations/${organizationId}/members`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all lists on a board
   *
   * @param boardId ID of the board
   * @param fields Fields to include
   */
  public async getListsOnBoard(boardId: string, fields = 'all'): Promise<List[]> {
    const query = this.createQuery();
    query.fields = fields;

    return makeRequest<List[]>('GET', `/1/boards/${boardId}/lists`, { query }, this.uri);
  }

  /**
   * Gets lists on a board filtered by status
   *
   * @param boardId ID of the board
   * @param filter Filter value (e.g., 'open', 'closed')
   */
  public async getListsOnBoardByFilter(boardId: string, filter: string): Promise<List[]> {
    const query = this.createQuery();
    query.filter = filter;

    return makeRequest<List[]>('GET', `/1/boards/${boardId}/lists`, { query }, this.uri);
  }

  /**
   * Gets all cards on a board
   *
   * @param boardId ID of the board
   */
  public async getCardsOnBoard(boardId: string): Promise<Card[]> {
    return makeRequest<Card[]>(
      'GET',
      `/1/boards/${boardId}/cards`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets cards on a board with extra parameters
   *
   * @param boardId ID of the board
   * @param extraParams Additional parameters
   * @param fields Fields to include
   */
  public async getCardsOnBoardWithExtraParams(
    boardId: string,
    extraParams: Record<string, unknown>,
    fields = 'all'
  ): Promise<Card[]> {
    const query = this.createQuery();
    Object.assign(query, extraParams);
    query.fields = fields;

    return makeRequest<Card[]>('GET', `/1/boards/${boardId}/cards`, { query }, this.uri);
  }

  /**
   * Gets all custom fields on a board
   *
   * @param boardId ID of the board
   */
  public async getCustomFieldsOnBoard(boardId: string): Promise<CustomField[]> {
    return makeRequest<CustomField[]>(
      'GET',
      `/1/boards/${boardId}/customFields`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Adds a custom field to a board
   *
   * @param boardId ID of the board
   * @param name Name of the custom field
   */
  public async addCustomField(boardId: string, name: string): Promise<CustomField> {
    const query = this.createQuery();
    const data = {
      idModel: boardId,
      modelType: 'board',
      name,
      options: [],
      pos: 'bottom',
      type: 'list',
    };

    return makeRequest<CustomField>('POST', '/1/customFields', { data, query }, this.uri);
  }

  /**
   * Adds an option to a custom field
   *
   * @param customFieldId ID of the custom field
   * @param value Option value
   */
  public async addOptionToCustomField(
    customFieldId: string,
    value: string
  ): Promise<TrelloResponse> {
    const query = this.createQuery();
    const data = {
      pos: 'bottom',
      value: {
        text: value,
      },
    };

    return makeRequest(
      'POST',
      `/1/customFields/${customFieldId}/options`,
      { data, query },
      this.uri
    );
  }

  /**
   * Sets a custom field value on a card
   *
   * @param cardId ID of the card
   * @param customFieldId ID of the custom field
   * @param value Value to set
   */
  public async setCustomFieldOnCard(
    cardId: string,
    customFieldId: string,
    value: unknown
  ): Promise<TrelloResponse> {
    const query = this.createQuery();

    return makeRequest(
      'PUT',
      `/1/card/${cardId}/customField/${customFieldId}/item`,
      { data: value, query },
      this.uri
    );
  }

  /**
   * Gets all cards on a list
   *
   * @param listId ID of the list
   */
  public async getCardsOnList(listId: string): Promise<Card[]> {
    return makeRequest<Card[]>(
      'GET',
      `/1/lists/${listId}/cards`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets cards on a list with extra parameters
   *
   * @param listId ID of the list
   * @param extraParams Additional parameters
   */
  public async getCardsOnListWithExtraParams(
    listId: string,
    extraParams: Record<string, unknown>
  ): Promise<Card[]> {
    const query = this.createQuery();
    Object.assign(query, extraParams);

    return makeRequest<Card[]>('GET', `/1/lists/${listId}/cards`, { query }, this.uri);
  }

  /**
   * Deletes a card
   *
   * @param cardId ID of the card
   */
  public async deleteCard(cardId: string): Promise<TrelloResponse> {
    return makeRequest('DELETE', `/1/cards/${cardId}`, { query: this.createQuery() }, this.uri);
  }

  /**
   * Adds a webhook
   *
   * @param description Description of the webhook
   * @param callbackUrl Callback URL
   * @param idModel ID of the model to watch
   */
  public async addWebhook(
    description: string,
    callbackUrl: string,
    idModel: string
  ): Promise<Webhook> {
    const query = this.createQuery();
    const data = {
      description,
      callbackURL: callbackUrl,
      idModel,
    };

    return makeRequest<Webhook>(
      'POST',
      `/1/tokens/${this.token}/webhooks/`,
      { data, query },
      this.uri
    );
  }

  /**
   * Deletes a webhook
   *
   * @param webhookId ID of the webhook
   */
  public async deleteWebhook(webhookId: string): Promise<TrelloResponse> {
    const query = this.createQuery();

    return makeRequest('DELETE', `/1/webhooks/${webhookId}`, { query }, this.uri);
  }

  /**
   * Gets all labels on a board
   *
   * @param boardId ID of the board
   */
  public async getLabelsForBoard(boardId: string): Promise<Label[]> {
    return makeRequest<Label[]>(
      'GET',
      `/1/boards/${boardId}/labels`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all actions on a board
   *
   * @param boardId ID of the board
   */
  public async getActionsOnBoard(boardId: string): Promise<TrelloResponse[]> {
    return makeRequest<TrelloResponse[]>(
      'GET',
      `/1/boards/${boardId}/actions`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Adds a label to a board
   *
   * @param boardId ID of the board
   * @param name Name of the label
   * @param color Color of the label
   */
  public async addLabelOnBoard(boardId: string, name: string, color: string): Promise<Label> {
    const query = this.createQuery();
    const data = {
      idBoard: boardId,
      color,
      name,
    };

    return makeRequest<Label>('POST', '/1/labels', { data, query }, this.uri);
  }

  /**
   * Deletes a label
   *
   * @param labelId ID of the label
   */
  public async deleteLabel(labelId: string): Promise<TrelloResponse> {
    return makeRequest('DELETE', `/1/labels/${labelId}`, { query: this.createQuery() }, this.uri);
  }

  /**
   * Adds a label to a card
   *
   * @param cardId ID of the card
   * @param labelId ID of the label
   */
  public async addLabelToCard(cardId: string, labelId: string): Promise<TrelloResponse> {
    const query = this.createQuery();
    const data = { value: labelId };

    return makeRequest('POST', `/1/cards/${cardId}/idLabels`, { query, data }, this.uri);
  }

  /**
   * Removes a label from a card
   *
   * @param cardId ID of the card
   * @param labelId ID of the label
   */
  public async deleteLabelFromCard(cardId: string, labelId: string): Promise<TrelloResponse> {
    return makeRequest(
      'DELETE',
      `/1/cards/${cardId}/idLabels/${labelId}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Updates a card position
   *
   * @param cardId ID of the card
   * @param position New position
   */
  public async updateCardPos(cardId: string, position: string | number): Promise<TrelloResponse> {
    const query = this.createQuery();
    const data = { pos: position };

    return makeRequest('PUT', `/1/cards/${cardId}`, { query, data }, this.uri);
  }

  /**
   * Updates a label
   *
   * @param labelId ID of the label
   * @param field Field to update
   * @param value New value
   */
  public async updateLabel(labelId: string, field: string, value: string): Promise<TrelloResponse> {
    const query = this.createQuery();
    query.value = value;

    return makeRequest('PUT', `/1/labels/${labelId}/${field}`, { query }, this.uri);
  }

  /**
   * Updates a label name
   *
   * @param labelId ID of the label
   * @param name New name
   */
  public async updateLabelName(labelId: string, name: string): Promise<TrelloResponse> {
    return this.updateLabel(labelId, 'name', name);
  }

  /**
   * Updates a label color
   *
   * @param labelId ID of the label
   * @param color New color
   */
  public async updateLabelColor(labelId: string, color: string): Promise<TrelloResponse> {
    return this.updateLabel(labelId, 'color', color);
  }

  /**
   * Gets all stickers on a card
   *
   * @param cardId ID of the card
   */
  public async getCardStickers(cardId: string): Promise<Sticker[]> {
    return makeRequest<Sticker[]>(
      'GET',
      `/1/cards/${cardId}/stickers`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Adds a sticker to a card
   *
   * @param cardId ID of the card
   * @param image Sticker image
   * @param left Left position
   * @param top Top position
   * @param zIndex z-index
   * @param rotate Rotation angle
   */
  public async addStickerToCard(
    cardId: string,
    image: string,
    left: number,
    top: number,
    zIndex: number,
    rotate: number
  ): Promise<Sticker> {
    const query = this.createQuery();
    const data = {
      image,
      top,
      left,
      zIndex,
      rotate,
    };

    return makeRequest<Sticker>('POST', `/1/cards/${cardId}/stickers`, { query, data }, this.uri);
  }

  /**
   * Adds a due date to a card
   *
   * @param cardId ID of the card
   * @param dateValue Due date value
   */
  public async addDueDateToCard(cardId: string, dateValue: string): Promise<TrelloResponse> {
    const query = this.createQuery();
    query.value = dateValue;

    return makeRequest('PUT', `/1/cards/${cardId}/due`, { query }, this.uri);
  }

  /**
   * Updates a custom field value on a card
   *
   * @param cardId ID of the card
   * @param fieldId ID of the custom field
   * @param value New value
   */
  public async updateCustomFieldOnCard(
    cardId: string,
    fieldId: string,
    value: unknown
  ): Promise<TrelloResponse> {
    const options = {
      query: this.createQuery(),
      headers: { 'Content-Type': 'application/json' },
      data: { value },
    };

    return makeRequest('PUT', `/1/cards/${cardId}/customField/${fieldId}/item`, options, this.uri);
  }

  /**
   * Gets all custom fields on a card
   *
   * @param cardId ID of the card
   */
  public async getCustomFieldsOnCard(cardId: string): Promise<TrelloResponse[]> {
    return makeRequest<TrelloResponse[]>(
      'GET',
      `/1/cards/${cardId}/customFieldItems`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets all attachments on a card
   *
   * @param cardId ID of the card
   */
  public async getAttachmentsOnCard(cardId: string): Promise<TrelloResponse[]> {
    return makeRequest<TrelloResponse[]>(
      'GET',
      `/1/cards/${cardId}/attachments`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets a specific action
   *
   * @param actionId ID of the action
   */
  public async getAction(actionId: string): Promise<TrelloResponse> {
    return makeRequest<TrelloResponse>(
      'GET',
      `/1/actions/${actionId}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets a specific field of an action
   *
   * @param actionId ID of the action
   * @param field Field to retrieve
   */
  public async getActionField(actionId: string, field: string): Promise<TrelloResponse> {
    return makeRequest<TrelloResponse>(
      'GET',
      `/1/actions/${actionId}/${field}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Updates an action (only comment actions can be updated)
   *
   * @param actionId ID of the action
   * @param text New text content
   */
  public async updateAction(actionId: string, text: string): Promise<TrelloResponse> {
    const query = this.createQuery();
    query.text = text;

    return makeRequest('PUT', `/1/actions/${actionId}`, { query }, this.uri);
  }

  /**
   * Updates the text of a comment action
   *
   * @param actionId ID of the action
   * @param text New text content
   */
  public async updateCommentAction(actionId: string, text: string): Promise<TrelloResponse> {
    const query = this.createQuery();
    query.value = text;

    return makeRequest('PUT', `/1/actions/${actionId}/text`, { query }, this.uri);
  }

  /**
   * Deletes an action (only comment actions can be deleted)
   *
   * @param actionId ID of the action
   */
  public async deleteAction(actionId: string): Promise<TrelloResponse> {
    return makeRequest('DELETE', `/1/actions/${actionId}`, { query: this.createQuery() }, this.uri);
  }

  /**
   * Gets the board associated with an action
   *
   * @param actionId ID of the action
   */
  public async getActionBoard(actionId: string): Promise<Board> {
    return makeRequest<Board>(
      'GET',
      `/1/actions/${actionId}/board`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets the card associated with an action
   *
   * @param actionId ID of the action
   */
  public async getActionCard(actionId: string): Promise<Card> {
    return makeRequest<Card>(
      'GET',
      `/1/actions/${actionId}/card`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets the list associated with an action
   *
   * @param actionId ID of the action
   */
  public async getActionList(actionId: string): Promise<List> {
    return makeRequest<List>(
      'GET',
      `/1/actions/${actionId}/list`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets the member associated with an action
   *
   * @param actionId ID of the action
   */
  public async getActionMember(actionId: string): Promise<Member> {
    return makeRequest<Member>(
      'GET',
      `/1/actions/${actionId}/member`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets the member creator of an action
   *
   * @param actionId ID of the action
   */
  public async getActionMemberCreator(actionId: string): Promise<Member> {
    return makeRequest<Member>(
      'GET',
      `/1/actions/${actionId}/memberCreator`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets the organization associated with an action
   *
   * @param actionId ID of the action
   */
  public async getActionOrganization(actionId: string): Promise<Organization> {
    return makeRequest<Organization>(
      'GET',
      `/1/actions/${actionId}/organization`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets reactions for an action
   *
   * @param actionId ID of the action
   * @param params Additional parameters
   */
  public async getActionReactions(
    actionId: string,
    params?: { member?: boolean; emoji?: boolean }
  ): Promise<TrelloResponse[]> {
    const query = this.createQuery();

    if (params) {
      if (params.member !== undefined) query.member = params.member;
      if (params.emoji !== undefined) query.emoji = params.emoji;
    }

    return makeRequest<TrelloResponse[]>(
      'GET',
      `/1/actions/${actionId}/reactions`,
      { query },
      this.uri
    );
  }

  /**
   * Adds a reaction to an action
   *
   * @param actionId ID of the action
   * @param reaction Reaction data
   */
  public async addReactionToAction(
    actionId: string,
    reaction: { shortName: string; skinVariation?: string; native?: string; unified?: string }
  ): Promise<TrelloResponse> {
    return makeRequest(
      'POST',
      `/1/actions/${actionId}/reactions`,
      {
        query: this.createQuery(),
        headers: { 'Content-Type': 'application/json' },
        data: reaction,
      },
      this.uri
    );
  }

  /**
   * Gets a specific reaction on an action
   *
   * @param actionId ID of the action
   * @param reactionId ID of the reaction
   * @param params Additional parameters
   */
  public async getActionReaction(
    actionId: string,
    reactionId: string,
    params?: { member?: boolean; emoji?: boolean }
  ): Promise<TrelloResponse> {
    const query = this.createQuery();

    if (params) {
      if (params.member !== undefined) query.member = params.member;
      if (params.emoji !== undefined) query.emoji = params.emoji;
    }

    return makeRequest<TrelloResponse>(
      'GET',
      `/1/actions/${actionId}/reactions/${reactionId}`,
      { query },
      this.uri
    );
  }

  /**
   * Deletes a reaction from an action
   *
   * @param actionId ID of the action
   * @param reactionId ID of the reaction
   */
  public async deleteActionReaction(actionId: string, reactionId: string): Promise<TrelloResponse> {
    return makeRequest(
      'DELETE',
      `/1/actions/${actionId}/reactions/${reactionId}`,
      { query: this.createQuery() },
      this.uri
    );
  }

  /**
   * Gets a summary of reactions for an action
   *
   * @param actionId ID of the action
   */
  public async getActionReactionsSummary(actionId: string): Promise<TrelloResponse> {
    return makeRequest<TrelloResponse>(
      'GET',
      `/1/actions/${actionId}/reactionsSummary`,
      { query: this.createQuery() },
      this.uri
    );
  }
}
