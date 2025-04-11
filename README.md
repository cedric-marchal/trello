# Trello API Client

[![Tests Status](https://img.shields.io/badge/tests-100%25%20passing-brightgreen)](https://github.com/cedric-marchal/trello)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-green)](https://github.com/cedric-marchal/trello)
[![NPM Version](https://img.shields.io/npm/v/@cedric-marchal/trello.svg)](https://www.npmjs.com/package/@cedric-marchal/trello)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

A modern, fully typed TypeScript client for the [Trello API](https://developer.atlassian.com/cloud/trello/rest/) with full type safety and automatic rate limiting.

> **Note**: This project is a TypeScript reimplementation based on [norberteder/trello](https://github.com/norberteder/trello), with additional features and improved type safety.

## Features

- Complete TypeScript typings for all API endpoints
- Modern ES Modules support
- Uses native `fetch` (Node.js 18+)
- Promise-based API
- Full IntelliSense support
- Complete support for Actions and Reactions API

## Installation

```sh
# Using pnpm (recommended)
pnpm add @cedric-marchal/trello

# Using npm
npm install @cedric-marchal/trello

# Using yarn
yarn add @cedric-marchal/trello
```

## Usage

```typescript
import { Trello } from '@cedric-marchal/trello';

// Create a new Trello client
const trello = new Trello('YOUR_API_KEY', 'YOUR_API_TOKEN');

// Example: Get boards for a member
async function getMyBoards() {
  const boards = await trello.getBoards({ memberId: 'me' });
  console.log(boards);
}

// Example: Add a card to a list
async function addCardToList(listId: string) {
  const card = await trello.addCard({
    name: 'Card Title',
    description: 'Card Description',
    listId,
  });
  console.log(`Added card: ${card.name}`);
}

// Example: Add a webhook
async function setupWebhook(modelId: string, callbackUrl: string) {
  const webhook = await trello.addWebhook('My Webhook', callbackUrl, modelId);
  console.log(`Created webhook: ${webhook.id}`);
}

// Example: Add a reaction to a comment
async function addReactionToComment(actionId: string) {
  const reaction = await trello.addReactionToAction(actionId, { shortName: '+1' });
  console.log(`Added reaction: ${reaction.emoji.shortName}`);
}
```

## Authentication

Visit [Trello's Developer API Keys](https://trello.com/app-key) to get your API key and generate a token.

## Available Methods

### Boards

- `addBoard({ name, description?, organizationId? })`
- `copyBoard({ name, sourceBoardId })`
- `updateBoardPref({ boardId, field, value })`
- `getBoards({ memberId })`
- `getBoardMembers(boardId)`
- `getListsOnBoard(boardId, fields?)`
- `getListsOnBoardByFilter(boardId, filter)`
- `getCardsOnBoard(boardId)`
- `getCardsOnBoardWithExtraParams(boardId, extraParams, fields?)`
- `getLabelsForBoard(boardId)`
- `getActionsOnBoard(boardId)`
- `getCustomFieldsOnBoard(boardId)`
- `addMemberToBoard({ boardId, memberId, type })`
- `addLabelOnBoard(boardId, name, color)`
- `addListToBoard({ boardId, name })`

### Lists

- `addListToBoard({ boardId, name })`
- `getCardsOnList(listId)`
- `getCardsOnListWithExtraParams(listId, extraParams)`
- `getCardsForList({ listId, actions? })`
- `renameList({ listId, name })`

### Cards

- `addCard({ name, description, listId })`
- `addCardWithExtraParams({ name, extraParams, listId })`
- `getCard({ boardId, cardId })`
- `getCardById({ cardId })`
- `updateCard(cardId, field, value)`
- `updateCardName(cardId, name)`
- `updateCardDescription(cardId, description)`
- `updateCardList(cardId, listId)`
- `updateCardPos(cardId, position)`
- `deleteCard(cardId)`
- `getAttachmentsOnCard(cardId)`
- `addAttachmentToCard({ cardId, url })`
- `addCommentToCard({ cardId, comment })`
- `addMemberToCard({ cardId, memberId })`
- `delMemberFromCard({ cardId, memberId })`
- `addChecklistToCard(cardId, name)`
- `addExistingChecklistToCard(cardId, checklistId)`
- `getChecklistsOnCard(cardId)`
- `getActionsOnCard(cardId)`
- `addDueDateToCard(cardId, dateValue)`
- `getCardStickers(cardId)`
- `addStickerToCard(cardId, image, left, top, zIndex, rotate)`
- `addLabelToCard(cardId, labelId)`
- `deleteLabelFromCard(cardId, labelId)`
- `getCustomFieldsOnCard(cardId)`
- `updateCustomFieldOnCard(cardId, fieldId, value)`

### Actions

- `getAction(actionId, params?)` - Optionally accepts display, entities, fields and member parameters
- `getActionField(actionId, field)`
- `updateAction(actionId, text)`
- `updateCommentAction(actionId, text)`
- `deleteAction(actionId)`
- `getActionBoard(actionId)`
- `getActionCard(actionId)`
- `getActionList(actionId)`
- `getActionMember(actionId)`
- `getActionMemberCreator(actionId)`
- `getActionOrganization(actionId)`
- `getActionsOnCard(cardId)`
- `getActionsOnBoard(boardId)`

### Reactions

- `getActionReactions(actionId, options?)` - options can include member and emoji
- `addReactionToAction(actionId, reaction)` - reaction must contain shortName and can include skinVariation
- `getActionReaction(actionId, reactionId, options?)` - options can include member and emoji
- `deleteActionReaction(actionId, reactionId)`
- `getActionReactionsSummary(actionId)` - returns a summary with reaction counts

### Checklists

- `addChecklistToCard(cardId, name)`
- `addExistingChecklistToCard(cardId, checklistId)`
- `getChecklistsOnCard(cardId)`
- `addItemToChecklist(checklistId, name, pos)`
- `updateChecklist(checklistId, field, value)`

### Members

- `getMember(memberId)`
- `getBoards({ memberId })`
- `getMemberCards(memberId)`
- `getBoardMembers(boardId)`
- `getOrgMembers(organizationId)`
- `addMemberToBoard({ boardId, memberId, type })`
- `addMemberToCard({ cardId, memberId })`
- `delMemberFromCard({ cardId, memberId })`

### Organizations

- `getOrganization({ organizationId })`
- `getOrgBoards(organizationId)`
- `getOrgMembers(organizationId)`

### Labels

- `getLabelsForBoard(boardId)`
- `addLabelOnBoard(boardId, name, color)`
- `deleteLabel(labelId)`
- `addLabelToCard(cardId, labelId)`
- `deleteLabelFromCard(cardId, labelId)`
- `updateLabel(labelId, field, value)`
- `updateLabelName(labelId, name)`
- `updateLabelColor(labelId, color)`

### Custom Fields

- `getCustomFieldsOnBoard(boardId)`
- `addCustomField(boardId, name)`
- `addOptionToCustomField(customFieldId, value)`
- `setCustomFieldOnCard(cardId, customFieldId, value)`
- `getCustomFieldsOnCard(cardId)`
- `updateCustomFieldOnCard(cardId, fieldId, value)`

### Webhooks

- `addWebhook(description, callbackUrl, idModel)`
- `deleteWebhook(webhookId)`

### Low-level API Access

For endpoints not covered by the built-in methods, use the low-level `makeRequest` method:

```typescript
// Basic GET request
const result = await trello.makeRequest({
  requestMethod: 'GET',
  path: '/1/members/me/tokens',
  options: { webhooks: true },
});

// JSON POST request with data (uses Content-Type: application/json)
const newCustomField = await trello.makeRequest({
  requestMethod: 'POSTJSON', // Special method that handles JSON content-type
  path: '/1/customFields',
  options: {
    data: {
      idModel: 'board123',
      modelType: 'board',
      name: 'Priority',
      type: 'list',
    },
  },
});

// JSON PUT request
const updateResult = await trello.makeRequest({
  requestMethod: 'PUTJSON', // Special method for PUT with JSON body
  path: '/1/cards/card123',
  options: {
    data: {
      name: 'Updated Card Name',
      desc: 'New description',
    },
  },
});
```

Valid request methods:

- `GET` - For retrieving data
- `POST` - For creating resources with form data
- `POSTJSON` - For creating resources with JSON data
- `PUT` - For updating resources with form data
- `PUTJSON` - For updating resources with JSON data
- `DELETE` - For removing resources

## Error Handling

All API methods return promises that reject with an error when an API call fails. The error object includes the full HTTP response for detailed debugging:

```typescript
try {
  const boards = await trello.getBoards({ memberId: 'me' });
  console.log(boards);
} catch (error) {
  // Basic error handling
  console.error('API Error:', error.message);

  // Advanced error handling with response details
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Status Text:', error.response.statusText);

    // Handle specific error cases
    if (error.response.status === 401) {
      console.error('Authentication error - check your API key and token');
    } else if (error.response.status === 404) {
      console.error('Resource not found');
    }
  }
}
```

## Type Definitions

This library provides detailed TypeScript types that match the Trello API specifications:

### Action Types

```typescript
// Parameters when getting an action
interface GetActionParams {
  display?: boolean; // Whether to include display info
  entities?: boolean; // Whether to include entities
  fields?: string; // Specific fields to return
  member?: boolean; // Whether to include member data
  member_fields?: string; // Member fields to return
  memberCreator?: boolean; // Whether to include creator data
  memberCreator_fields?: string; // Creator fields to return
}

// Parameters when getting reactions
interface GetActionReactionsParams {
  member?: boolean; // Include member data with reactions
  emoji?: boolean; // Include emoji details
}

// Parameters when creating a reaction
interface ReactionCreateParams {
  shortName: string; // Emoji short name, e.g. '+1'
  skinVariation?: string; // Skin tone variation
  native?: string; // Native emoji character
  unified?: string; // Unicode representation
}

// Summary of reactions
interface ActionReactionsSummary {
  summary: Array<{
    shortName: string; // Emoji short name
    count: number; // Number of this reaction
    me: boolean; // Whether current user reacted
  }>;
}
```

## New Features in This Version

This version represents a TypeScript reimplementation of the [original Trello client](https://github.com/norberteder/trello) with the following improvements:

- **Native TypeScript**: Complete rewrite in TypeScript with precise types for all entities and APIs (original is pure JavaScript)
- **ES Modules**: Full support for modern ES modules instead of CommonJS
- **Fetch API**: Uses native Fetch API instead of third-party libraries like needle/restler in the original
- **Actions & Reactions API**: Complete support for Actions and Reactions APIs not available in the original
- **Rate Limiting**: Automatic handling of Trello API rate limits with intelligent retries
- **Generic Types**: Use of generic types for better type inference and IDE support
- **Parameter Objects**: Structured parameter objects for cleaner method calls rather than multiple parameters
- **Complete JSDoc Documentation**: Full documentation for all methods and parameters

### Actions API Support

The complete Actions API is now supported, allowing you to:

- Get, update, and delete actions (comments, etc.)
- Access related resources (board, card, list, etc.) of an action
- Manage comment actions

Example:

```typescript
// Get a comment action
const action = await trello.getAction('action123');

// Update a comment
await trello.updateCommentAction('action123', 'Updated comment text');

// Get the card associated with an action
const card = await trello.getActionCard('action123');
```

### Reactions API Support

Full support for the Reactions API, enabling emoji reactions on comments:

- Add reactions to actions (like 👍, 😄, etc.)
- Get reactions for an action
- Remove reactions
- Get summarized reaction counts

Example:

```typescript
// Add a reaction to a comment
await trello.addReactionToAction('action123', { shortName: '+1' });

// Get all reactions for a comment
const reactions = await trello.getActionReactions('action123');

// Get a summary of reactions (counts by emoji)
const summary = await trello.getActionReactionsSummary('action123');
```

## Modern Parameter Syntax

This library uses a parameter object syntax for better readability and TypeScript support:

```typescript
// Get boards for a member
const boards = await trello.getBoards({ memberId: 'me' });

// Add a card to a list
const card = await trello.addCard({
  name: 'Card Title',
  description: 'Card Description',
  listId: 'list123',
});
```

## License

MIT - see LICENSE file for details.

## Rate Limiting

This library automatically handles Trello's API rate limits. When you hit a rate limit:

1. The request will be paused temporarily
2. It will automatically retry after the recommended wait time
3. All this happens transparently without any manual handling required

You don't need to implement any error handling for rate limits - the library takes care of it.

The library automatically handles Trello's API rate limits with zero configuration required:

- When a rate limit is encountered, requests are automatically paused
- The system will wait for the recommended cooldown period from Trello's API headers
- Requests are intelligently retried after the wait period (up to 3 retry attempts)
- All of this happens transparently without any custom error handling code

Example: Even if you rapidly make many API calls, this library will manage the timing to ensure your requests succeed without you needing to implement any rate limit logic.

```typescript
// These calls will automatically respect rate limits
// You don't need to add any special code for handling rate limits
const boards = await trello.getBoards({ memberId: 'me' });
const cards = await trello.getCardsOnBoard({ boardId: boards[0].id });
const members = await trello.getBoardMembers({ boardId: boards[0].id });
// ... and so on with any number of requests
```

## Current Limitations

While this library covers most common Trello API functionality, the following features are not yet implemented:

- **Enterprise API**: No support for Trello Enterprise-specific endpoints
- **Plugins API**: No support for the Plugins API endpoints
- **Batch API**: No support for batch operations that allow executing multiple API calls in a single request
- **Limited Notifications Support**: Only basic notification functionality is included
- **Limited Emoji API**: Only supports emoji in the context of reactions, not the full Emoji API

If you need these features, consider contributing to the project or using the `makeRequest` method to access these endpoints directly.
