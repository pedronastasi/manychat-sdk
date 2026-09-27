export { ManyChat, type ManyChatOptions } from './client.ts';
export type { RequestOptions } from './http/transport.ts';
export type { RateLimitOptions } from './http/rate-limiter.ts';

export {
  ManyChatError,
  ManyChatApiError,
  ManyChatResponseError,
  ManyChatConnectionError,
  type ConnectionFailure,
} from './errors.ts';

export type { PageApi } from './api/page.ts';
export type { SubscriberApi } from './api/subscriber.ts';
export type { SendingApi } from './api/sending.ts';

export type {
  CreateTagParams,
  RemoveTagParams,
  RemoveTagByNameParams,
  CreateCustomFieldParams,
  CreateBotFieldParams,
  SetBotFieldParams,
  SetBotFieldByNameParams,
  SetBotFieldsParams,
} from './api/page.ts';
export type {
  GetInfoParams,
  FindByNameParams,
  GetInfoByUserRefParams,
  FindByCustomFieldParams,
  FindBySystemFieldParams,
  TagByIdParams,
  TagByNameParams,
  SetCustomFieldParams,
  SetCustomFieldByNameParams,
  SetCustomFieldsParams,
  VerifyBySignedRequestParams,
  SubscriberProfile,
  CreateSubscriberParams,
  UpdateSubscriberParams,
} from './api/subscriber.ts';
export type {
  SendContentParams,
  SendContentByUserRefParams,
  SendFlowParams,
} from './api/sending.ts';
export type { SubscriberId, UserRef, FieldRef, FieldAssignment } from './api/params.ts';
export type { Content, Message, Card, Button, QuickReply, Action } from './api/content.ts';

export type { FieldType, FieldValue } from './schemas/common.ts';
export type {
  Page,
  Tag,
  CustomField,
  BotField,
  GrowthTool,
  Flow,
  Folder,
  Flows,
  OtnTopic,
} from './schemas/page.ts';
export type { Subscriber, SubscriberCustomField, SubscriberUserRef } from './schemas/subscriber.ts';
