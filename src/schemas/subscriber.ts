import { z } from 'zod';
import { ExternalId, FieldValue, list, nullable } from './common.ts';
import { Tag } from './page.ts';

export const SubscriberCustomField = z.looseObject({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  description: nullable(z.string()),
  value: nullable(FieldValue),
});
export type SubscriberCustomField = z.infer<typeof SubscriberCustomField>;

export const SubscriberUserRef = z.looseObject({
  user_ref: ExternalId,
  /** W3C datetime. */
  opted_in: nullable(z.string()),
});
export type SubscriberUserRef = z.infer<typeof SubscriberUserRef>;

export const Subscriber = z.looseObject({
  id: ExternalId,
  page_id: nullable(ExternalId),
  user_refs: list(SubscriberUserRef),
  first_name: nullable(z.string()),
  last_name: nullable(z.string()),
  name: nullable(z.string()),
  gender: nullable(z.string()),
  profile_pic: nullable(z.string()),
  locale: nullable(z.string()),
  language: nullable(z.string()),
  timezone: nullable(z.string()),
  live_chat_url: nullable(z.string()),
  last_input_text: nullable(z.string()),
  optin_phone: nullable(z.boolean()),
  phone: nullable(z.string()),
  optin_email: nullable(z.boolean()),
  email: nullable(z.string()),
  /** W3C datetime. */
  subscribed: nullable(z.string()),
  /** W3C datetime. */
  last_interaction: nullable(z.string()),
  /** W3C datetime. */
  last_seen: nullable(z.string()),
  is_followup_enabled: nullable(z.boolean()),
  ig_username: nullable(z.string()),
  ig_id: nullable(ExternalId),
  whatsapp_phone: nullable(z.string()),
  whatsapp_bsuid: nullable(z.string()),
  whatsapp_username: nullable(z.string()),
  optin_whatsapp: nullable(z.boolean()),
  custom_fields: list(SubscriberCustomField),
  tags: list(Tag),
});
export type Subscriber = z.infer<typeof Subscriber>;
