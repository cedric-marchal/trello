// src/types.ts

// Request types
export type RequestMethod = 'post' | 'get' | 'put' | 'delete' | 'postjson' | 'putjson';

export interface RequestOptions {
  [key: string]: unknown;
}

export interface RequestQuery {
  key: string;
  token: string;
  [key: string]: unknown;
}

export interface JsonRequestOptions {
  headers: {
    'Content-Type': string;
  };
  data?: unknown;
  query: RequestQuery;
}

// Response types
export interface TrelloResponse {
  [key: string]: unknown;
}

// Trello entity types
export interface Board extends TrelloResponse {
  id: string;
  name: string;
  desc?: string;
  closed?: boolean;
  idOrganization?: string;
  url?: string;
}

export interface List extends TrelloResponse {
  id: string;
  name: string;
  closed?: boolean;
  idBoard: string;
  pos?: number;
}

export interface Card extends TrelloResponse {
  id: string;
  name: string;
  desc?: string;
  closed?: boolean;
  idBoard: string;
  idList: string;
  pos?: number;
  due?: string;
  dueComplete?: boolean;
  url?: string;
}

export interface Checklist extends TrelloResponse {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  pos?: number;
}

export interface CheckItem extends TrelloResponse {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
  idChecklist: string;
  pos?: number;
}

export interface Member extends TrelloResponse {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Label extends TrelloResponse {
  id: string;
  name: string;
  color: string;
  idBoard: string;
}

export interface Organization extends TrelloResponse {
  id: string;
  name: string;
  displayName: string;
  desc?: string;
  url?: string;
}

export interface CustomField extends TrelloResponse {
  id: string;
  name: string;
  type: string;
  pos?: number;
  idModel: string;
  modelType: string;
}

export interface Webhook extends TrelloResponse {
  id: string;
  description: string;
  callbackURL: string;
  idModel: string;
  active: boolean;
}

export interface Sticker extends TrelloResponse {
  id: string;
  image: string;
  imageUrl: string;
  top: number;
  left: number;
  zIndex: number;
  rotate?: number;
}

// Action related types
export type ActionFields =
  | 'id'
  | 'data'
  | 'type'
  | 'date'
  | 'idMemberCreator'
  | 'display'
  | 'memberCreator'
  | 'limits';

export interface Reaction extends TrelloResponse {
  id: string;
  idMember: string;
  idModel: string;
  idAction: string;
  emoji: {
    unified: string;
    native: string;
    name: string;
    shortName: string;
    skinVariation?: string;
  };
  member?: Member;
}

export interface Action extends TrelloResponse {
  id: string;
  idMemberCreator: string;
  data: Record<string, unknown>;
  type: string;
  date: string;
  memberCreator?: Member;
  member?: Member;
  display?: {
    translationKey: string;
    entities: Record<string, unknown>;
  };
  limits?: {
    reactions: {
      perAction: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
      uniquePerAction: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
}

// Parameters for API requests
export interface GetActionParams {
  display?: boolean;
  entities?: boolean;
  fields?: string;
  member?: boolean;
  member_fields?: string;
  memberCreator?: boolean;
  memberCreator_fields?: string;
}

export interface GetActionReactionsParams {
  member?: boolean;
  emoji?: boolean;
}

export interface ReactionCreateParams {
  shortName: string;
  skinVariation?: string;
  native?: string;
  unified?: string;
}

export interface ActionReactionsSummary {
  summary: Array<{
    shortName: string;
    count: number;
    me: boolean;
  }>;
}
